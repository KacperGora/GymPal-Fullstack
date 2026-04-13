import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { useRegister } from '@/features/auth/mutations/useRegister';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { mutate: register, isPending, error } = useRegister();

  const handleRegister = () => {
    register({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>GymPal</Text>
        <Text style={styles.subtitle}>Utwórz konto</Text>

        {error && (
          <Text style={styles.error}>
            Rejestracja nie powiodła się. Sprawdź dane i spróbuj ponownie.
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Imię"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoComplete="given-name"
        />

        <TextInput
          style={styles.input}
          placeholder="Nazwisko"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoComplete="family-name"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <Pressable
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Zarejestruj się</Text>
          )}
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>Masz już konto? Zaloguj się</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#2563EB', fontSize: 14 },
  error: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
  },
});
