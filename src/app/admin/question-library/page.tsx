"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { PageIntro } from "@/components/admin/page-intro";
import { SimpleStatCard } from "@/components/admin/simple-stat-card";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSchools, useSchoolQuestions } from "@/services/schools.service";
import { useAddQuestions, useDeleteQuestion } from "@/services/admin.service";
import { toast } from "sonner";
import type { Question } from "@/types/domain";

const DIFFICULTY_STYLES = {
  easy: "bg-[#eef8ea] text-[#53b930]",
  medium: "bg-[#fefae8] text-[#f8cc16]",
  hard: "bg-[#fdebe7] text-[#fc5a33]",
} as const;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function QuestionLibraryPage() {
  const [open, setOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("");

  const schools = useSchools();
  const schoolList = schools.data?.data ?? [];

  // Use first school as default if none selected
  const activeSchoolId = selectedSchoolId || schoolList[0]?.id || "";
  const questions = useSchoolQuestions(activeSchoolId, { limit: 100 });
  const questionList = questions.data?.data ?? [];

  const addQuestions = useAddQuestions();
  const deleteQuestion = useDeleteQuestion();

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || !activeSchoolId) {
      toast.error("Please fill in the question and select a school");
      return;
    }
    addQuestions.mutate(
      {
        schoolId: activeSchoolId,
        data: {
          questions: [
            {
              text: newQuestion.trim(),
              category: newCategory || "behavioral",
              difficulty: newDifficulty || "medium",
            },
          ],
        },
      },
      {
        onSuccess: () => {
          toast.success("Question added successfully");
          setOpen(false);
          setNewQuestion("");
          setNewCategory("");
          setNewDifficulty("");
          questions.refetch();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to add question");
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteQuestion.mutate(id, {
      onSuccess: () => {
        toast.success("Question deleted");
        questions.refetch();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete question");
      },
    });
  };

  const columns: AdminColumn<Question>[] = [
    {
      key: "text",
      header: "Question",
      cell: (r) => (
        <span className="font-body text-[16px] text-[#272727]">{r.text}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => (
        <span className="inline-flex items-center justify-center rounded-full bg-[#eeeefe] px-4.5 py-2.5 font-body text-[16px] text-primary">
          {capitalize(r.category)}
        </span>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      cell: (r) => (
        <span
          className={`inline-flex items-center justify-center rounded-full px-4.5 py-2.5 font-body text-[16px] leading-5 ${DIFFICULTY_STYLES[r.difficulty] ?? ""}`}
        >
          {capitalize(r.difficulty)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-35",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Delete"
            onClick={() => handleDelete(r.id)}
            className="text-[#fc5a33] transition-opacity hover:opacity-70"
          >
            <Icon icon="material-symbols:delete-rounded" width={20} height={20} />
          </button>
        </div>
      ),
    },
  ];

  const activeSchoolName =
    schoolList.find((s) => s.id === activeSchoolId)?.name ?? "All";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageIntro
          title="Question Library"
          description="Manage interview questions across schools and categories"
        />
        <Button
          onClick={() => setOpen(true)}
          className="h-12 gap-2 rounded-[16px] bg-primary px-6 font-heading text-[16px] font-semibold text-white shadow-md hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add-rounded" width={20} height={20} />
          Add Question
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-140">
            <DialogHeader>
              <DialogTitle className="font-heading text-[22px] font-semibold text-[#272727]">
                Add New Question
              </DialogTitle>
              <DialogDescription className="font-body text-[14px] text-[#868686]">
                Create a new question for {activeSchoolName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  rows={3}
                  placeholder="Enter the interview question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={newCategory} onValueChange={(v) => setNewCategory(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="situational">Situational</SelectItem>
                      <SelectItem value="goals_motivation">Goals / Motivation</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="teamwork">Teamwork</SelectItem>
                      <SelectItem value="school_specific">School Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Difficulty</Label>
                  <Select value={newDifficulty} onValueChange={(v) => setNewDifficulty(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddQuestion}
                disabled={addQuestions.isPending}
              >
                {addQuestions.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Question"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SimpleStatCard
          value={questionList.length.toLocaleString()}
          label="Total Questions"
          icon="mdi:library"
          iconBgClass="bg-gradient-to-br from-[#4a46c3] to-[#5450d8]"
        />
        <SimpleStatCard
          value={[...new Set(questionList.map((q) => q.category))].length.toString()}
          label="Categories"
          icon="material-symbols:category-rounded"
          iconBgClass="bg-gradient-to-br from-[#48a927] to-[#53b930]"
        />
        <SimpleStatCard
          value={schoolList.length.toString()}
          label="Schools"
          icon="material-symbols:school-rounded"
          iconBgClass="bg-gradient-to-br from-[#e5b900] to-[#f8cc16]"
        />
        <SimpleStatCard
          value={activeSchoolName}
          label="Current Filter"
          icon="material-symbols:filter-list-rounded"
          iconBgClass="bg-gradient-to-br from-[#fc5a33] to-[#e0441e]"
        />
      </div>

      {/* School filter */}
      <div className="flex items-center gap-3">
        <span className="font-body text-[14px] text-[#868686]">Filter by school:</span>
        <select
          value={activeSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="h-10 w-64 rounded-lg border border-[#e2e2f0] bg-white px-3 font-body text-[14px] text-[#272727] outline-none focus:border-primary"
        >
          {schoolList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {questions.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="ml-2 font-body text-[14px] text-[#868686]">
            Loading questions...
          </span>
        </div>
      ) : (
        <AdminTable columns={columns} data={questionList} rowKey={(r) => r.id} />
      )}
    </div>
  );
}
