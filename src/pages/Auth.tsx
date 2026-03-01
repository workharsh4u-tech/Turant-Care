import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { signIn, signUp, type AppRole } from "@/lib/auth";

const roles: { value: AppRole; label: string; desc: string }[] = [
  { value: "patient", label: "Patient", desc: "Access your medical reports" },
  { value: "doctor", label: "Doctor (Self Clinic)", desc: "View patient reports" },
  { value: "diagnostic_center", label: "Diagnostic Center", desc: "Upload patient reports" },
  { value: "hospital_admin", label: "Hospital Admin", desc: "Manage hospital & doctors" },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("patient");
  const [hospitalName, setHospitalName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      const r = profile.role as string;
      if (r === "patient") navigate("/patient/dashboard");
      else if (r === "doctor" || r === "hospital_admin") navigate("/doctor/dashboard");
      else if (r === "diagnostic_center") navigate("/diagnostic/dashboard");
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const extra: Record<string, string> = {};
        if (role === "hospital_admin") extra.hospital_name = hospitalName;
        const { error } = await signUp(email, password, role, fullName, extra);
        if (error) throw error;
        toast({ title: "Account created!", description: "You're now signed in." });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Welcome back!" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-8">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Your Medical Records, Simplified</h2>
          <p className="text-primary-foreground/80 text-lg">
            One card. All your reports. Secure access for doctors and diagnostic centers.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">
            {isSignup ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignup ? "Choose your role and get started" : "Sign in to your account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>

                <div>
                  <Label>Role</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`p-3 rounded-lg border text-left transition-all text-sm ${
                          role === r.value
                            ? "border-primary bg-accent shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{r.label}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {role === "hospital_admin" && (
                  <div>
                    <Label>Hospital Name</Label>
                    <Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="City General Hospital" required />
                  </div>
                )}
              </>
            )}

            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
