"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { Id } from "../../../convex/_generated/dataModel";

interface JoinCourseButtonProps {
    courseId: Id<"courses">;
    className?: string;
}

export function JoinCourseButton({ courseId, className }: JoinCourseButtonProps) {
    const { t } = useI18n();
    const [isLoading, setIsLoading] = useState(false);

    const isJoined = useQuery(api.userCourses.isJoined, { courseId });
    const addCourse = useMutation(api.userCourses.addCourse);
    const currentUser = useQuery(api.users.getCurrentUser);

    // Don't show if not logged in or already joined
    if (!currentUser || isJoined === undefined) {
        return null;
    }

    if (isJoined) {
        return (
            <span className={`text-sm text-success font-medium ${className}`}>
                {t.course?.joined || "已加入"}
            </span>
        );
    }

    const handleJoin = async () => {
        setIsLoading(true);
        try {
            await addCourse({ courseId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleJoin}
            isLoading={isLoading}
            className={className}
        >
            {t.course?.joinCourse || "加入课程"}
        </Button>
    );
}
