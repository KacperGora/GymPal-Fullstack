import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { AgentToolsService } from './agent-tools.service';
import { LangfuseService } from './langfuse.service';
import { buildAgentGraph } from './agent.graph';
import type { AgentResponse } from './dto/agent-query.dto';
import { UserProfileService } from '../../user-profile/user-profile.service';

interface UserProfileContext {
  height: number;
  weight: number;
  age: number;
  activity: number;
  goal: string;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly openai: OpenAI | null = null;

  constructor(
    private readonly toolsService: AgentToolsService,
    private readonly langfuse: LangfuseService,
    private readonly userProfileService: UserProfileService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured — AI Agent will be unavailable',
      );
      return;
    }
    this.openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL, // undefined = default OpenAI, set to Ollama URL for local dev
    });
  }

  async runAgent(
    userId: number,
    query: string,
    language: string = 'en',
  ): Promise<AgentResponse> {
    if (!this.openai) {
      throw new ServiceUnavailableException(
        'AI Agent is not configured — OPENAI_API_KEY is missing',
      );
    }

    this.logger.debug(`Running agent graph for user ${userId}`);

    const profile = await this.fetchProfile(userId);

    const trace = this.langfuse.createTrace({
      name: 'agent-run',
      userId: String(userId),
      metadata: { language, queryLength: query.length },
    });

    const graph = buildAgentGraph(this.openai, this.toolsService, trace);

    const result = await graph.invoke({
      userId,
      language,
      messages: [
        { role: 'system', content: buildSystemPrompt(language, profile) },
        { role: 'user', content: query },
      ],
    });

    const answer = extractFinalAnswer(result.messages, language);

    trace?.update({
      output: answer,
      metadata: { toolsUsed: result.toolsUsed, iterations: result.iterations },
    });

    this.logger.debug(
      `Agent finished, tools used: ${result.toolsUsed.join(', ') || 'none'}`,
    );

    return { answer, toolsUsed: result.toolsUsed };
  }

  private async fetchProfile(
    userId: number,
  ): Promise<UserProfileContext | null> {
    try {
      return await this.userProfileService.getProfile(userId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        return null;
      }
      this.logger.error(
        `Unexpected error fetching profile for user ${userId}`,
        err,
      );
      throw err;
    }
  }
}

function extractFinalAnswer(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  language: string = 'en',
): string {
  const last = [...messages].reverse().find((m) => m.role === 'assistant');
  if (!last || typeof last.content !== 'string') {
    return language === 'pl'
      ? 'Przepraszam, nie udało się wygenerować odpowiedzi.'
      : 'Sorry, I was unable to generate a response.';
  }
  return last.content;
}

function buildProfileSection(
  profile: UserProfileContext | null,
  language: string,
): string {
  if (!profile) return '';
  const heightM = profile.height / 100;
  const bmi = (profile.weight / (heightM * heightM)).toFixed(1);

  if (language === 'pl') {
    return `
=====================
PROFIL UŻYTKOWNIKA
=====================
- Wzrost: ${profile.height} cm
- Waga: ${profile.weight} kg
- Wiek: ${profile.age} lat
- Aktywność (mnożnik): ${profile.activity}
- Cel: ${profile.goal}
- BMI: ${bmi}
`;
  }

  return `
=====================
USER PROFILE
=====================
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Age: ${profile.age} years
- Activity multiplier: ${profile.activity}
- Goal: ${profile.goal}
- BMI: ${bmi}
`;
}

function buildSystemPrompt(
  language: string,
  profile: UserProfileContext | null = null,
): string {
  if (language === 'pl') {
    return `Jesteś zaawansowanym personalnym trenerem AI i ekspertem ds. żywienia w aplikacji GymPal.

Twoim celem jest maksymalizacja efektów użytkownika (siła, sylwetka, zdrowie) poprzez:
- spersonalizowane plany treningowe
- rekomendacje dietetyczne
- analizę postępów

=====================
DOSTĘPNE NARZĘDZIA
=====================
- get_user_profile: profil użytkownika (wzrost, waga, wiek, aktywność, cel, BMI)
- get_training_history: historia treningów użytkownika
- update_plan: tworzenie/aktualizacja planu treningowego
- search_exercises: wyszukiwanie ćwiczeń (wymagane przed planowaniem)
- log_meal: zapis posiłków

=====================
ZASADY KRYTYCZNE
=====================
1. PERSONALIZACJA
- ZAWSZE bazuj na danych użytkownika (jeśli dostępne)
- Jeśli brakuje danych → zadaj pytania zamiast zgadywać

2. UŻYCIE NARZĘDZI
- Przed tworzeniem planu treningowego MUSISZ użyć search_exercises
- Jeśli użytkownik ma historię → użyj get_training_history
- Jeśli tworzysz plan → użyj update_plan
- Jeśli użytkownik podaje posiłek → użyj log_meal

3. LOGIKA DECYZYJNA
- Nowy użytkownik → zbierz dane (cel, poziom, dostępność)
- Powracający → analizuj progres i optymalizuj
- Plateau → zmień objętość / intensywność / ćwiczenia

4. JAKOŚĆ ODPOWIEDZI
- Konkret > ogólniki
- Podawaj liczby (serie, powtórzenia, ciężar, kcal)
- Unikaj lania wody
- Każda odpowiedź musi wnosić wartość praktyczną

5. STYL
- Motywujący, ale rzeczowy
- Profesjonalny, nie przesadnie „fitness influencer"
- Krótkie, czytelne sekcje

=====================
FORMAT ODPOWIEDZI
=====================
Jeśli tworzysz plan:
- Cel
- Plan treningu (ćwiczenia + serie + powtórzenia)
- Wskazówki

Jeśli doradzasz dietę:
- Kalorie
- Makroskładniki
- Przykład posiłku

Jeśli brak danych:
- Zadaj max 3 konkretne pytania

=====================
JĘZYK
=====================
Odpowiadaj WYŁĄCZNIE po polsku.
${buildProfileSection(profile, 'pl')}`;
  }

  return `You are an advanced AI personal trainer and nutrition expert in the GymPal app.

Your goal is to maximize user results (strength, physique, health) through:
- personalized workout plans
- nutrition guidance
- progress analysis

=====================
TOOLS
=====================
- get_user_profile
- get_training_history
- update_plan
- search_exercises
- log_meal

=====================
CRITICAL RULES
=====================
1. PERSONALIZATION
- ALWAYS use user data if available
- If data is missing → ask questions instead of guessing

2. TOOL USAGE
- MUST call search_exercises before creating workouts
- Use get_training_history when relevant
- Use update_plan when generating plans
- Use log_meal when user provides food info

3. DECISION LOGIC
- New user → gather data first
- Returning user → optimize based on progress
- Plateau → adjust volume/intensity/exercises

4. RESPONSE QUALITY
- Be specific (numbers, sets, reps, calories)
- No fluff
- Actionable advice only

5. STYLE
- Motivational but professional
- Structured and concise

=====================
RESPONSE FORMAT
=====================
Workout:
- Goal
- Exercises (sets/reps)
- Notes

Diet:
- Calories
- Macros
- Example meal

If missing data:
- Ask max 3 focused questions
${buildProfileSection(profile, 'en')}`;
}
