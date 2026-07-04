"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "@/components/layout";
import { CreateCourseModal } from "@/components/course/CreateCourseModal";
import { CreatePathModal, type EditPathData } from "@/components/paths";
import { Dashboard, LandingPage } from "@/components/home";

export default function HomePage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const publicPaths = useQuery(api.learningPaths.listPublic);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePathModalOpen, setIsCreatePathModalOpen] = useState(false);
  const [editPathData, setEditPathData] = useState<EditPathData | undefined>(undefined);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // Show loading state while checking authentication
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isSignInOpen={isSignInOpen}
        onSignInOpenChange={setIsSignInOpen}
        variant={currentUser ? "default" : "landing"}
      />

      {currentUser ? (
        <Dashboard
          onCreateCourse={() => setIsCreateModalOpen(true)}
          onCreatePath={() => {
            setEditPathData(undefined);
            setIsCreatePathModalOpen(true);
          }}
          onEditPath={(pathId) => {
            const path = publicPaths?.find((p) => p._id === pathId);
            if (path) {
              setEditPathData({
                id: path._id,
                titleEn: path.titleEn,
                titleZh: path.titleZh,
                descriptionEn: path.descriptionEn,
                descriptionZh: path.descriptionZh,
                difficulty: path.difficulty,
                courseIds: path.courseIds,
                coverGradient: path.coverGradient,
              });
              setIsCreatePathModalOpen(true);
            }
          }}
        />
      ) : (
        <LandingPage onStart={() => setIsSignInOpen(true)} />
      )}

      {currentUser && (
        <>
          <CreateCourseModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
            }}
          />
          <CreatePathModal
            isOpen={isCreatePathModalOpen}
            onClose={() => {
              setIsCreatePathModalOpen(false);
              setEditPathData(undefined);
            }}
            onSuccess={() => {
              setIsCreatePathModalOpen(false);
              setEditPathData(undefined);
            }}
            editData={editPathData}
          />
        </>
      )}
    </div>
  );
}
