package de.tum.in.www1.artemis.service.messaging;

/**
 * Topic identifiers for Hazelcast messages between instances.
 */
public enum MessageTopic {

    // @formatter:off
    PROGRAMMING_EXERCISE_SCHEDULE("programming-exercise-schedule"),
    PROGRAMMING_EXERCISE_SCHEDULE_CANCEL("programming-exercise-schedule-cancel"),
    MODELING_EXERCISE_SCHEDULE("modeling-exercise-schedule"),
    MODELING_EXERCISE_SCHEDULE_CANCEL("modeling-exercise-schedule-cancel"),
    MODELING_EXERCISE_INSTANT_CLUSTERING("modeling-exercise-instant-clustering"),
    TEXT_EXERCISE_SCHEDULE("text-exercise-schedule"),
    TEXT_EXERCISE_SCHEDULE_CANCEL("text-exercise-schedule-cancel"),
    TEXT_EXERCISE_INSTANT_CLUSTERING("text-exercise-instant-clustering"),
    PROGRAMMING_EXERCISE_UNLOCK_REPOSITORIES("programming-exercise-unlock-repositories"),
    PROGRAMMING_EXERCISE_LOCK_REPOSITORIES("programming-exercise-lock-repositories"),
    PROGRAMMING_EXERCISE_UNLOCK_WITHOUT_EARLIER_DUE_DATE("programming-exercise-unlock-repositories-without-earlier-individual-due-date"),
    PROGRAMMING_EXERCISE_LOCK_WITHOUT_LATER_DUE_DATE("programming-exercise-lock-repositories-without-later-individual-due-date"),
    USER_MANAGEMENT_REMOVE_NON_ACTIVATED_USERS("user-management-remove-non-activated-users"),
    USER_MANAGEMENT_CANCEL_REMOVE_NON_ACTIVATED_USERS("user-management-cancel-remove-non-activated-users"),
    EXERCISE_RELEASED_SCHEDULE("exercise-released-schedule"),
    ASSESSED_EXERCISE_SUBMISSION_SCHEDULE("assessed-exercise-submission-schedule"),
    EXAM_MONITORING_SCHEDULE("exam-monitoring-schedule"),
    EXAM_MONITORING_SCHEDULE_CANCEL("exam-monitoring-schedule-cancel"),
    STUDENT_EXAM_RESCHEDULE_DURING_CONDUCTION("student-exam-reschedule-during-conduction"),
    PARTICIPANT_SCORE_SCHEDULE("participant-score-schedule");
    // @formatter:on

    private final String topic;

    MessageTopic(String topic) {
        this.topic = topic;
    }

    @Override
    public String toString() {
        return topic;
    }
}
