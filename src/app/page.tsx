"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, PlusIcon } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { CreateCourseModal } from "@/components/course/CreateCourseModal";
import { CreatePathModal } from "@/components/paths";
import { Dashboard, LandingPage } from "@/components/home";

export default function HomePage() {
  const { t } = useI18n();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePathModalOpen, setIsCreatePathModalOpen] = useState(false);
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
      >
        {currentUser && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="w-5 h-5" />
            {t.home.newCourse}
          </Button>
        )}
      </Header>

      {currentUser ? (
        <Dashboard
          onCreateCourse={() => setIsCreateModalOpen(true)}
          onCreatePath={() => setIsCreatePathModalOpen(true)}
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
            onClose={() => setIsCreatePathModalOpen(false)}
            onSuccess={() => {
              setIsCreatePathModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
