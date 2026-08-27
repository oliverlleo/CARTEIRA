import { AuthForm } from '@/components/auth-form';
import { signUpWithEmail } from './actions';
export default function SignUpPage() { return <AuthForm mode="sign-up" action={signUpWithEmail} />; }
