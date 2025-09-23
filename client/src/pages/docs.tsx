import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, BookOpen, Search, Home } from "lucide-react";

interface DocItem {
  title: string;
  path: string; // relative to /docs
  category: string;
}

const DOCS_INDEX: DocItem[] = [
  { title: "README", path: "README.md", category: "Overview" },
  { title: "Quick Start", path: "getting-started/quick-start.md", category: "Getting Started" },
  { title: "AI Agents", path: "user-guide/ai-agents.md", category: "User Guide" },
  { title: "Version Control (GitHub)", path: "user-guide/version-control.md", category: "User Guide" },
  { title: "API Reference", path: "api/README.md", category: "Developer" },
];

export default function DocsPage() {
  const [activePath, setActivePath] = useState<string>(DOCS_INDEX[0].path);
  const [content, setContent] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/docs/${activePath}`);
        const text = await res.text();
        setContent(text);
      } catch (e) {
        setContent(`# Not found\n\nThe requested document could not be loaded.`);
      }
    };
    load();
  }, [activePath]);

  const filtered = DOCS_INDEX.filter(d =>
    d.title.toLowerCase().includes(filter.toLowerCase()) ||
    d.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen grid grid-cols-12">
      <aside className="col-span-3 border-r p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="font-semibold">SpaceChild Docs</h1>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <a href="/">
              <Home className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search docs..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Separator />
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Button
              key={doc.path}
              variant={activePath === doc.path ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePath(doc.path)}
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="truncate">{doc.title}</span>
            </Button>
          ))}
        </div>
      </aside>
      <main className="col-span-9 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{DOCS_INDEX.find(d => d.path === activePath)?.title}</span>
            </CardTitle>
            <CardDescription>
              {DOCS_INDEX.find(d => d.path === activePath)?.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {content}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
