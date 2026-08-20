//Mariano Montini ('bosque', 'bosquestudio')
import type { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

// Providers props - app children wrapped by Thirdweb.
type ProvidersProps = {
  children: ReactNode;
};

// App providers - Thirdweb context for connect hooks.
export function Providers({ children }: ProvidersProps) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
