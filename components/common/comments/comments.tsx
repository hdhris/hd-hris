import React, {Fragment, useCallback, useState} from 'react';
import {Avatar, cn, ScrollShadow, Spinner, Textarea, User} from "@nextui-org/react";
import Typography from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import {toGMT8} from "@/lib/utils/toGMT8";
import {useSession} from "next-auth/react";
import {Button} from "@nextui-org/button";
import {LuSendHorizonal} from "react-icons/lu";
import {icon_color, icon_size_sm} from "@/lib/utils";
import {Comment, Reply, User as UserEvaluator} from "@/types/leaves/leave-evaluators-types";
import {TextAreaProps} from "@nextui-org/input";

interface CommentsProps {
    comments: Comment[],
    users: UserEvaluator[]
    onComment: (comment: string) => void
    onReply: (id: string, message: string) => void
    isClearableComment?: boolean
    isClearableReply?: boolean
    isSendingReply?: boolean
    isSendingComment?: boolean
}

function Comments({
                      comments,
                      users,
                      onComment,
                      onReply,
                      isClearableComment,
                      isClearableReply,
                      isSendingReply,
                      isSendingComment
                  }: CommentsProps) {
    const [reply, setReply] = useState<string | null>(null)
    const [comment, setComment] = useState<string | null>()
    const [commentId, setCommentId] = useState<string>()

    const handleOnClearReply = useCallback(() => {
        if (isClearableReply) setReply("")
    }, [isClearableReply])
    const handleOnClearComment = useCallback(() => {
        if (isClearableComment) setComment("")
    }, [isClearableComment])
    return (
        <>
            <ScrollShadow size={20} className="min-h-32 max-h-72">
                <div className="flex flex-col gap-10 h-full mb-4">
                    {comments.map(comment => {
                        const commenters = users.filter(commenter => Number(commenter.id) === Number(comment.author)).map(({
                                                                                                                               id,
                                                                                                                               ...rest
                                                                                                                           }) => ({id: Number(id), ...rest}))

                        const uniqueIds = new Set(commenters.map(user => user.id));
                        const hasDuplicates = uniqueIds.size !== commenters.length;

// Step 2: If there are duplicates, filter by role "approver"
                        let result;
                        if (hasDuplicates) {
                            const uniqueApproversSet = new Map();
                            commenters
                                .filter(user => user.role === "approver")
                                .forEach(user => uniqueApproversSet.set(user.id, user));
                            result = Array.from(uniqueApproversSet.values());
                        } else {
                            result = commenters; // No duplicates, return as is
                        }

                        const comments = result.map(item => ({
                            ...item, ...comment
                        }))
                        return (<Fragment key={comment.id}>{comments.map(comment_thread => {
                            return (<div key={comment_thread.id} className="flex flex-col gap-2">
                                    <User
                                        className="justify-start p-2"
                                        name={<Typography
                                            className="text-sm font-semibold">{comment_thread.name}</Typography>}
                                        description={<Typography
                                            className="text-sm font-semibold !text-default-400/75">
                                            {capitalize(comment_thread.role)}
                                        </Typography>}
                                        avatarProps={{
                                            src: comment_thread.picture,
                                            classNames: {base: '!size-6'},
                                            isBordered: true,
                                        }}
                                    />

                                    <div className="flex flex-col gap-2 ml-2">
                                        <Typography
                                            className="text-medium indent-4">{comment_thread.message}</Typography>
                                        <div className="flex gap-2">
                                            <Typography
                                                className="text-sm !text-default-400/75">{toGMT8(comment_thread.timestamp).format("MM/DD/YYYY hh:mm A")}</Typography>
                                            <Typography
                                                className="text-sm font-semibold cursor-pointer !text-default-400/75"
                                                onClick={() => {
                                                    setCommentId(comment_thread.id)
                                                    setReply("")
                                                }}>Reply</Typography>
                                        </div>
                                    </div>
                                    {comment_thread.replies.map((replies: Reply) => {
                                        const replier = users.filter(item => Number(item.id) === Number(replies.author))
                                        const reply = replier.map(item => ({
                                            ...item, ...replies
                                        }))
                                        return (reply.map(reply => {
                                            return (<div key={replies.id} className="ms-10 my-3">
                                                <User
                                                    className="justify-start p-2"
                                                    name={<Typography
                                                        className="text-sm font-semibold">{reply.name}</Typography>}
                                                    description={<Typography
                                                        className="text-sm font-semibold !text-default-400/75">
                                                        {capitalize(reply.role)}
                                                    </Typography>}
                                                    avatarProps={{
                                                        src: reply.picture,
                                                        classNames: {base: '!size-6'},
                                                        isBordered: true,
                                                    }}
                                                />
                                                <div className="flex flex-col gap-2 ml-4">
                                                    <Typography
                                                        className="text-medium indent-4">{replies.message}</Typography>
                                                    <div className="flex gap-2">
                                                        <Typography
                                                            className="text-sm !text-default-400/75">{toGMT8(replies.timestamp).format("MM/DD/YYYY hh:mm A")}</Typography>
                                                        <Typography
                                                            className="text-sm font-semibold cursor-pointer !text-default-400/75"
                                                            onClick={() => {
                                                                setCommentId(comment_thread.id)
                                                                setReply("")
                                                            }}>Reply</Typography>
                                                    </div>

                                                </div>
                                            </div>)
                                        }))
                                    })}
                                    {commentId === comment_thread.id && <div className="ms-10">
                                        <CommentInput
                                            placeholder="Reply..."
                                            // isSending={isReplySubmit}
                                            value={reply || ""}
                                            onSend={() => {
                                                onReply(comment_thread.id, reply!)
                                                handleOnClearReply()
                                            }}
                                            onValueChange={(value) => {
                                                setReply(value);
                                            }}
                                            disabled={!reply}
                                            isSending={isSendingReply}
                                        />
                                    </div>}
                                </div>

                            )
                        })}</Fragment>)
                    })}
                </div>
            </ScrollShadow>
            <div className="flex gap-2 items-center">
                <CommentInput
                    isSending={isSendingComment}
                    onSend={() => {
                        onComment(comment!)
                        handleOnClearComment()
                    }}
                    value={comment!}
                    disabled={!comment}
                    onValueChange={(value) => {
                        setComment(value)
                    }}/>

            </div>
        </>
    );
}

export default Comments;

interface CommentInputProps extends TextAreaProps {
    onSend?: () => void,
    isSending?: boolean
    placeholder?: string
    disabled?: boolean
}

const CommentInput = ({onSend, isSending, placeholder, disabled, ...rest}: CommentInputProps) => {
    const session = useSession()
    return (<div className="flex gap-2 w-full">
        <Avatar
            classNames={{
                base: "h-7 w-7"
            }}
            src={session.data?.user?.image}
        />
        <Textarea variant="bordered"
                  color="primary"
                  maxRows={3}
                  placeholder={placeholder || "Add comment..."}
                  {...rest}
        />
        <Button variant="light" isIconOnly size="sm" className="self-end" onClick={onSend} isDisabled={disabled}>
            {isSending ? <Spinner size="sm"/> : <LuSendHorizonal
                className={cn(icon_size_sm, icon_color)}
            />}

        </Button>
    </div>)
}