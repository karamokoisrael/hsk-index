import { AuthProvider } from '@/contexts/AuthContext';
import { getSession } from '@/libs/Auth';

export default async function AuthLayout(props: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AuthProvider initialUser={session}>
      {props.children}
    </AuthProvider>
  );
}
