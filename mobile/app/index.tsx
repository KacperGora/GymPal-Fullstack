import { Redirect } from 'expo-router';

// Tymczasowe przekierowanie do podglądu ekranów auth — usuń ten plik po przeglądzie
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
