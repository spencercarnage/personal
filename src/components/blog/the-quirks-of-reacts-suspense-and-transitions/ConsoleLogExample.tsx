import { useConsoleLog } from "./ConsoleLogProvider";
import Example, { type ExampleProps } from "./Example";

export default function ConsoleLogExample({ children, ...rest }: ExampleProps) {
  const { clear } = useConsoleLog();

  return (
    <Example onReset={clear} {...rest}>
      {children}
    </Example>
  );
}
