import { createFileRoute } from "@tanstack/react-router";
import EternalRealms from "@/components/EternalRealms";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <EternalRealms />;
}
