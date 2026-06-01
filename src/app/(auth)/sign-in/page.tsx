import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign in foundation</CardTitle>
        <CardDescription>
          Form handling, validation, and Supabase auth will be wired into this route later.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input disabled id="email" placeholder="you@example.com" type="email" />
          </div>
          <Button disabled type="submit">
            Authentication coming soon
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
