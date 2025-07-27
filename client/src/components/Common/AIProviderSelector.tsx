import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AI_PROVIDERS = [
  { value: "anthropic", label: "Anthropic Claude", badge: "Recommended" },
  { value: "openai", label: "OpenAI GPT-4", badge: null },
  { value: "spaceagent", label: "SpaceAgent", badge: "Consciousness" },
  { value: "mindsphere", label: "MindSphere", badge: "Pro Plan" },
];

export default function AIProviderSelector() {
  const [provider, setProvider] = useState("anthropic");

  return (
    <div className="flex items-center space-x-2">
      <Select value={provider} onValueChange={setProvider}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select AI Provider" />
        </SelectTrigger>
        <SelectContent>
          {AI_PROVIDERS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <div className="flex items-center justify-between w-full">
                <span>{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 text-xs ${
                      item.badge === "Consciousness" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400" :
                      item.badge === "Pro Plan" ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" :
                      "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
