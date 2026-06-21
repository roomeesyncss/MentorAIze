"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trainingApi } from "@/lib/training";
import { analyticsApi } from "@/lib/analytics";
import { toast } from "sonner";
import { Loader2, Check, X, Lightbulb, HelpCircle, Pencil, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

function safeArray(raw: any, ...keys: string[]): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  for (const k of keys) {
    if (Array.isArray(raw[k])) return raw[k];
  }
  return [];
}

export default function TrainingPage() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<any>(null);
  const [editedAnswer, setEditedAnswer] = useState("");
  const [approvingId, setApprovingId] = useState<number | string | null>(null);
  const [skippingId, setSkippingId] = useState<number | string | null>(null);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["training-suggestions"],
    queryFn: () => trainingApi.getSuggestions({ status: "pending" }),
  });

  const { data: missedData, isLoading: missedLoading } = useQuery({
    queryKey: ["missed-questions"],
    queryFn: () => analyticsApi.getMissedQuestions({ limit: 20 }),
  });

  const suggestions = safeArray(suggestionsData?.data, "suggestions", "data", "items", "results");
  const missed = safeArray(missedData?.data, "questions", "missed_questions", "data", "items", "results");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await trainingApi.generateSuggestions();
      toast.success("AI suggestions generated!");
      queryClient.invalidateQueries({ queryKey: ["training-suggestions"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (suggestion: any) => {
    const id = suggestion.id ?? suggestion.suggestion_id;
    setApprovingId(id);
    try {
      await trainingApi.approveSuggestion(id);
      toast.success("Suggestion approved and added to training!");
      queryClient.invalidateQueries({ queryKey: ["training-suggestions"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to approve");
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveEdited = async () => {
    if (!editingSuggestion) return;
    const id = editingSuggestion.id ?? editingSuggestion.suggestion_id;
    setApprovingId(id);
    try {
      await trainingApi.approveSuggestion(id, editedAnswer);
      toast.success("Edited suggestion approved!");
      queryClient.invalidateQueries({ queryKey: ["training-suggestions"] });
      setEditingSuggestion(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to approve");
    } finally {
      setApprovingId(null);
    }
  };

  const handleSkip = async (suggestion: any) => {
    const id = suggestion.id ?? suggestion.suggestion_id;
    setSkippingId(id);
    try {
      await trainingApi.skipSuggestion(id);
      toast.success("Suggestion skipped");
      queryClient.invalidateQueries({ queryKey: ["training-suggestions"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to skip");
    } finally {
      setSkippingId(null);
    }
  };

  const openEdit = (suggestion: any) => {
    setEditingSuggestion(suggestion);
    setEditedAnswer(suggestion.suggested_answer || "");
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="text-muted-foreground mt-1">Review unanswered questions and AI-generated training suggestions</p>
      </div>

      <Tabs defaultValue="suggestions">
        <TabsList>
          <TabsTrigger value="suggestions">
            AI Suggestions
            {suggestions.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">{suggestions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="missed">Unanswered Questions ({missed.length})</TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {suggestions.length} pending suggestion(s)
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} size="sm">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate from Gaps
                </>
              )}
            </Button>
          </div>

          {suggestionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No pending suggestions</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click &quot;Generate from Gaps&quot; to create AI training suggestions from unanswered questions
                </p>
                <Button onClick={handleGenerate} disabled={isGenerating} variant="outline">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Suggestions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s: any) => {
                const id = s.id ?? s.suggestion_id;
                return (
                  <Card key={id}>
                    <CardContent className="py-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Question</p>
                        <p className="font-medium">{s.question}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Suggested Answer</p>
                        <p className="text-sm text-muted-foreground">{s.suggested_answer}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(s)}
                          disabled={approvingId === id || skippingId === id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {approvingId === id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><Check className="h-4 w-4 mr-1" />Approve</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(s)}
                          disabled={approvingId === id || skippingId === id}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit & Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSkip(s)}
                          disabled={approvingId === id || skippingId === id}
                          className="text-muted-foreground"
                        >
                          {skippingId === id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><X className="h-4 w-4 mr-1" />Skip</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Missed Questions Tab */}
        <TabsContent value="missed" className="mt-6">
          {missedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : missed.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No unanswered questions</p>
                <p className="text-sm text-muted-foreground">Your chatbot is handling all questions well!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {missed.map((q: any, i: number) => (
                <Card key={q.id ?? i}>
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{q.question || q.content || q.text}</p>
                      {q.asked_at && (
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(q.asked_at)}</p>
                      )}
                    </div>
                    {q.count > 1 && (
                      <Badge variant="secondary" className="shrink-0">{q.count}x</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit & Approve Dialog */}
      <Dialog open={!!editingSuggestion} onOpenChange={(open) => !open && setEditingSuggestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit & Approve Suggestion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Question</p>
              <p className="font-medium">{editingSuggestion?.question}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Answer</p>
              <Textarea
                rows={5}
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                placeholder="Edit the answer..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSuggestion(null)}>Cancel</Button>
            <Button
              onClick={handleApproveEdited}
              disabled={!editedAnswer.trim() || approvingId !== null}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approvingId !== null ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
