import type { ReactNode } from "react";
import { TamboProvider } from "@tambo-ai/react";
import { tamboEnvironment } from "@/config/tambo";
import { tamboComponents } from "@/lib/componentRegistry";
import { useAnonymousUserKey } from "@/lib/anonymousUser";

export default function TamboAppProvider({
  apiKey,
  children,
}: {
  apiKey: string;
  children: ReactNode;
}) {
  const userKey = useAnonymousUserKey();

  return (
    <TamboProvider
      apiKey={apiKey}
      environment={tamboEnvironment}
      userKey={userKey}
      components={tamboComponents}
    >
      {children}
    </TamboProvider>
  );
}
