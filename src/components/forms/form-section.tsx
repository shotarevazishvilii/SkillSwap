import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FormSection({
  children,
  description,
  title,
}: Readonly<{
  children: React.ReactNode;
  description?: string;
  title: string;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
