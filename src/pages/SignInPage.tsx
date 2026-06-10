
import { useState, useRef } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { MapPin } from "lucide-react";
import Recaptcha, { RecaptchaDisclosure, RecaptchaHandle } from "@/components/Recaptcha";
import { trackEvent } from "@/utils/tracking";

const SignInPage = () => {
  usePageMetadata({
    title: 'Sign In | DemoStoke',
    description: 'Access your DemoStoke account.'
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<RecaptchaHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    trackEvent("auth_signin_started", {
      signin_method: "email_password",
    });

    let captchaToken = "";
    try {
      captchaToken = (await recaptchaRef.current?.execute()) ?? "";
      await login(email, password, captchaToken);
      trackEvent("auth_signin_succeeded", {
        signin_method: "email_password",
      });
      setIsLoading(false);
      navigate("/");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message = err instanceof Error ? err.message : "Invalid email or password";
      trackEvent("auth_signin_failed_invalid_credentials", {
        signin_method: "email_password",
        failure_reason: captchaToken ? "invalid_credentials" : "captcha_missing_or_invalid",
      });
      setError(message);
      setIsLoading(false);
    }
  };

  // We use local loading state to avoid button getting stuck
  // if the global loading state isn't properly reset
  const buttonDisabled = isLoading;
  const buttonText = isLoading ? "Signing in..." : "Sign In";

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg dark:border-muted">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <MapPin className="h-6 w-6 text-ocean-DEFAULT dark:text-blue-400" />
          <CardTitle className="text-2xl ml-2">Sign In to DemoStoke</CardTitle>
        </div>
        <CardDescription className="dark:text-gray-400">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline dark:text-blue-400">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </CardContent>
        {/* Invisible challenge; renders no visible UI (badge is hidden, disclosure shown below) */}
        <Recaptcha ref={recaptchaRef} hideBadge />
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={buttonDisabled}>
            {buttonText}
          </Button>
          <RecaptchaDisclosure />
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignInPage;
