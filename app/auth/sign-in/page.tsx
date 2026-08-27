import { AuthForm } from '@/components/auth-form';
import { signInWithEmail } from './actions';
export default function SignInPage() { return <AuthForm mode="sign-in" action={signInWithEmail} />; }
