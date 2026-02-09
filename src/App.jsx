import { useState, useEffect, useRef } from "react";
import sheetData from "./data/sheet.json";
import { parseSheetData } from "./utils/parseSheetData";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "interactive-question-sheet-data";

/* ================= APP ================= */

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [topics, setTopics] = useState([]);
  const [topicTitle, setTopicTitle] = useState("");
  const hasLoaded = useRef(false);

  /* LOAD DATA (localStorage → dataset) */
  useEffect(() => {
    setTopics(parseSheetData(sheetData.data.questions));
  }, []);


  /* SAVE DATA */
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  /* ========== TOPIC CRUD ========== */

  const addTopic = () => {
    if (!topicTitle.trim()) return;
    setTopics([
      ...topics,
      { id: crypto.randomUUID(), title: topicTitle, subTopics: [] }
    ]);
    setTopicTitle("");
  };

  const deleteTopic = (topicId) =>
    setTopics(topics.filter(t => t.id !== topicId));

  const reorderTopics = (oldIndex, newIndex) =>
    setTopics(arrayMove(topics, oldIndex, newIndex));

  /* ========== SUB-TOPIC CRUD ========== */

  const addSubTopic = (topicId, title) => {
    if (!title.trim()) return;
    setTopics(topics.map(t =>
      t.id === topicId
        ? {
            ...t,
            subTopics: [
              ...t.subTopics,
              { id: crypto.randomUUID(), title, questions: [] }
            ]
          }
        : t
    ));
  };

  const deleteSubTopic = (topicId, subId) => {
    setTopics(topics.map(t =>
      t.id === topicId
        ? { ...t, subTopics: t.subTopics.filter(s => s.id !== subId) }
        : t
    ));
  };

  const reorderSubTopics = (topicId, oldIndex, newIndex) => {
    setTopics(topics.map(t =>
      t.id === topicId
        ? { ...t, subTopics: arrayMove(t.subTopics, oldIndex, newIndex) }
        : t
    ));
  };

  /* ========== QUESTION CRUD ========== */

  const addQuestion = (topicId, subId, text) => {
    if (!text.trim()) return;
    setTopics(topics.map(t =>
      t.id === topicId
        ? {
            ...t,
            subTopics: t.subTopics.map(s =>
              s.id === subId
                ? {
                    ...s,
                    questions: [
                      ...s.questions,
                      { id: crypto.randomUUID(), text }
                    ]
                  }
                : s
            )
          }
        : t
    ));
  };

  const deleteQuestion = (topicId, subId, qId) => {
    setTopics(topics.map(t =>
      t.id === topicId
        ? {
            ...t,
            subTopics: t.subTopics.map(s =>
              s.id === subId
                ? { ...s, questions: s.questions.filter(q => q.id !== qId) }
                : s
            )
          }
        : t
    ));
  };

  const reorderQuestions = (topicId, subId, oldIndex, newIndex) => {
    setTopics(topics.map(t =>
      t.id === topicId
        ? {
            ...t,
            subTopics: t.subTopics.map(s =>
              s.id === subId
                ? { ...s, questions: arrayMove(s.questions, oldIndex, newIndex) }
                : s
            )
          }
        : t
    ));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        Interactive Question Management Sheet
      </h1>

      {/* ADD TOPIC */}
      <div className="bg-white p-6 rounded-x shadow-sm flex gap-3 items-center">
        <input
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Add topic"
          value={topicTitle}
          onChange={(e) => setTopicTitle(e.target.value)}
        />
        <button
          onClick={addTopic}
          className="bg-black text-white px-4 rounded"
        >
          Add
        </button>

        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }}
          className="text-red-500 underline text-sm"
        >
          Reset
        </button>
      </div>

      {/* DRAG TOPICS */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          reorderTopics(
            topics.findIndex(t => t.id === active.id),
            topics.findIndex(t => t.id === over.id)
          );
        }}
      >
        <SortableContext
          items={topics.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {topics.map(topic => (
              <SortableTopic
                key={topic.id}
                topic={topic}
                deleteTopic={deleteTopic}
                addSubTopic={addSubTopic}
                deleteSubTopic={deleteSubTopic}
                reorderSubTopics={reorderSubTopics}
                addQuestion={addQuestion}
                deleteQuestion={deleteQuestion}
                reorderQuestions={reorderQuestions}
              />
            ))}
          </div>
        </SortableContext>
        </DndContext>
  </div>
</div>

  );
}

/* ================= SORTABLE TOPIC ================= */

function SortableTopic(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.topic.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <TopicCard {...props} dragListeners={listeners} />
    </div>
  );
}

/* ================= TOPIC CARD ================= */

function TopicCard({
  topic,
  deleteTopic,
  addSubTopic,
  deleteSubTopic,
  reorderSubTopics,
  addQuestion,
  deleteQuestion,
  reorderQuestions,
  dragListeners
}) {
  const [subTitle, setSubTitle] = useState("");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center">
          <span {...dragListeners} className="cursor-grab text-gray-400">☰</span>
          <h2 className="font-semibold">{topic.title}</h2>
        </div>
        <button
          onClick={() => deleteTopic(topic.id)}
          className="text-red-500 text-sm"
        >
          Delete
        </button>
      </div>

      {/* ADD SUB-TOPIC */}
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 border px-2 py-1 rounded text-sm"
          placeholder="Add sub-topic"
          value={subTitle}
          onChange={(e) => setSubTitle(e.target.value)}
        />
        <button
          onClick={() => {
            addSubTopic(topic.id, subTitle);
            setSubTitle("");
          }}
          className="bg-slate-800 text-white px-3 rounded text-sm"
        >
          Add
        </button>
      </div>

      {/* SUB-TOPICS */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          reorderSubTopics(
            topic.id,
            topic.subTopics.findIndex(s => s.id === active.id),
            topic.subTopics.findIndex(s => s.id === over.id)
          );
        }}
      >
        <SortableContext
          items={topic.subTopics.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-5 ml-6 pl-4 border-l border-slate-200">
            {topic.subTopics.map(sub => (
              <SortableSubTopic
                key={sub.id}
                sub={sub}
                topicId={topic.id}
                deleteSubTopic={deleteSubTopic}
                addQuestion={addQuestion}
                deleteQuestion={deleteQuestion}
                reorderQuestions={reorderQuestions}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ================= SORTABLE SUB-TOPIC ================= */

function SortableSubTopic(props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.sub.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <SubTopicCard {...props} dragListeners={listeners} />
    </div>
  );
}

/* ================= SUB-TOPIC CARD ================= */

function SubTopicCard({
  sub,
  topicId,
  deleteSubTopic,
  addQuestion,
  deleteQuestion,
  reorderQuestions,
  dragListeners
}) {
  const [questionText, setQuestionText] = useState("");

  return (
    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <span {...dragListeners} className="cursor-grab text-gray-400">☰</span>
          <h3 className="font-medium">{sub.title}</h3>
        </div>
        <button
          onClick={() => deleteSubTopic(topicId, sub.id)}
          className="text-red-500 text-xs"
        >
          Delete
        </button>
      </div>

      {/* ADD QUESTION */}
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 border px-2 py-1 rounded text-sm"
          placeholder="Add question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        <button
          onClick={() => {
            addQuestion(topicId, sub.id, questionText);
            setQuestionText("");
          }}
          className="bg-black text-white px-2 rounded text-xs"
        >
          Add
        </button>
      </div>

      {/* QUESTIONS */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          reorderQuestions(
            topicId,
            sub.id,
            sub.questions.findIndex(q => q.id === active.id),
            sub.questions.findIndex(q => q.id === over.id)
          );
        }}
      >
        <SortableContext
          items={sub.questions.map(q => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 ml-6">
            {sub.questions.map(q => (
              <SortableQuestion
                key={q.id}
                q={q}
                topicId={topicId}
                subId={sub.id}
                deleteQuestion={deleteQuestion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ================= SORTABLE QUESTION ================= */

function SortableQuestion({ q, topicId, subId, deleteQuestion }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: q.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className="flex justify-between items-center bg-white px-3 py-2 rounded-md text-sm shadow-sm"
    >
      <div className="flex gap-2 items-center">
        <span {...listeners} className="cursor-grab text-gray-400">☰</span>
        <span>{q.text}</span>
      </div>
      <button
        onClick={() => deleteQuestion(topicId, subId, q.id)}
        className="text-red-500 text-xs"
      >
        Delete
      </button>
    </div>
  );
}
