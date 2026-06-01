import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthMessage({
  message,
  type,
}: {
  message: string | null;
  type: "error" | "success";
}) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant={type === "error" ? "destructive" : "success"}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
