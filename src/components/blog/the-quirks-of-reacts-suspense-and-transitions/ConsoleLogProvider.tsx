import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type LogMessage = {
  message: string;
  date: Date;
  file: string;
};
type ConsoleLogContextType = {
  clear: () => void;
  log: (log: LogMessage) => void;
};

const ConsoleLogContext = createContext<ConsoleLogContextType | null>(null);

export function useConsoleLog() {
  const context = useContext(ConsoleLogContext);

  if (!context) {
    throw new Error("useConsoleLog has to be used within ConsoleLogProvider");
  }
  return context;
}

export default function ConsoleLogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [logs, setLogs] = useState<Array<LogMessage & { id: string }>>([]);

  const log = useCallback((logMsg: LogMessage) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${prev.length + 1}`,
        ...logMsg,
      },
    ]);
  }, []);

  const clear = useCallback(() => {
    setLogs([]);
  }, []);

  const value = useMemo(() => {
    return {
      log,
      clear,
    };
  }, [clear, log]);

  return (
    <ConsoleLogContext.Provider value={value}>
      {children}
      {logs.map((log) => (
        <div key={log.id}>{log.message}</div>
      ))}
    </ConsoleLogContext.Provider>
  );
}
