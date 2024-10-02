"use client";
import React, {memo, useEffect, useMemo, useState} from 'react';
import {RequestFormTableType, RequestFormWithMethod} from "@/types/leaves/LeaveRequestTypes";
import {CardBody, CardHeader} from "@nextui-org/card";
import {
    Avatar, Button, Card, CardFooter, cn, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure
} from "@nextui-org/react";
import {LuDownload, LuMessagesSquare, LuTrash2} from "react-icons/lu";
import {icon_color, icon_size_sm} from "@/lib/utils";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import RenderList from "@/components/util/RenderList";
import {Case, Default, Switch} from '@/components/common/Switch';
import {useFormTable} from "@/components/providers/FormTableProvider";
import {useIsClient} from "@/hooks/ClientRendering";
import Loading from "@/components/spinner/Loading";

interface RequestCardProps {
    items: RequestFormTableType[];
    onDelete: (id: number) => void; // Updated to include deleted item
}


const Cards = memo(function Cards({items, onDelete}: RequestCardProps) {
    const {setFormData} = useFormTable<RequestFormWithMethod>();
    const itemsWithKey = useMemo(() => {
        return items.map(({id, ...item}) => ({key: id, ...item}));
    }, [items]);

    const handleDelete = (id: number) => {
        if (onDelete) {
            const deletedItem = itemsWithKey.map(({
                                                      key, ...item
                                                  }) => ({id: key, ...item})).find((item) => item.id === id); // Get the deleted item
            if (deletedItem) {
                console.log("Deleted: ", deletedItem);
                setFormData({
                    method: "Delete", data: deletedItem
                })
                onDelete(id);
            }
        }

    };

    const handleEdit = (id: number) => {
        const editedItem = itemsWithKey
            .map(({key, ...item}) => ({id: key, ...item}))
            .find(item => item.id === id);

        if (editedItem) {
            // Call setFormData only once if the item is found
            setFormData({
                method: "Edit", data: editedItem,
            });
        }
        // setEditId(id)
    };

    return (<RenderList
        items={itemsWithKey}
        map={(item, key) => {
            const data = item as unknown as RequestFormTableType;
            return (<Card className="w-[310px] h-[280px]" radius="sm" key={data.id} isHoverable isPressable isBlurred>
                <CardHeader className="justify-between">
                    <div className="flex gap-5">
                        <Avatar isBordered radius="full" size="md" src={data.picture}/>
                        <div className="flex flex-col gap-1 items-start justify-center">
                            <h4 className="text-small font-semibold leading-none text-default-600">{data.name}</h4>
                            <h5 className="text-small tracking-tight text-default-400">{data.department}</h5>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <LuTrash2
                            className="text-destructive cursor-pointer" // Add cursor pointer for better UX
                            onClick={() => handleDelete(Number(key))} // Call handleDelete with the item's key
                            aria-label="Delete Item"
                        />
                    </div>
                </CardHeader>
                <CardBody className="px-3 py-0 text-small text-default-400 w-full space-y-2"
                          onClick={() => handleEdit(Number(key))}>
                    <div className="flex">
                        <div className="border-2 border-r-0 w-full shadow-small flex justify-between">
                            <Typography className="text-medium font-medium m-4">{data.leave_type}</Typography>
                        </div>
                        <div
                            className="h-full w-1/2 bg-gray-100 p-2 border-2 border-l-0 border-gray-300 flex flex-col items-center">
                            <Typography className="text-sm font-medium text-gray-700">Days Applied</Typography>
                            <Chip className="size-5 px-0" variant="bordered" color="success">
                                <Typography
                                    className="text-sm font-semibold text-gray-900">{data.total_days}</Typography>
                            </Chip>
                        </div>
                    </div>
                    <ScrollShadow className="h-full" size={0}>
                        <Typography
                            className="px-3 py-0 text-small tracking-wide text-default-400">{data.reason}</Typography>
                    </ScrollShadow>
                </CardBody>
                <CardFooter className="gap-3 justify-between">
                    <div className="flex flex-col gap-1 items-center">
                        <div className="flex gap-2">
                            <Typography
                                className="font-semibold text-default-400 text-small space-x-2 text-right">
                                Start Date:
                            </Typography>
                            <span
                                className="font-semibold text-small text-default-400/80 text-left">{String(data.start_date)}</span>
                        </div>
                        <div className="flex gap-2">
                            <Typography
                                className="font-semibold text-default-400 text-small space-x-2 text-right">
                                End Date:
                            </Typography>
                            <span
                                className="font-semibold text-small text-default-400/80 text-left">{String(data.end_date)}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <CommentModal comment={data.comment || "No comment"}/>
                        <LuDownload
                            className="icon_color icon_size_sm" // Replace with actual class or function
                            aria-label="Download Icon"
                        />
                    </div>
                </CardFooter>
            </Card>);
        }}
    />);
});

const CommentModal = ({comment}: { comment: string }) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    return (<>
        <LuMessagesSquare
            className={cn("cursor-pointer", icon_color, icon_size_sm)}
            onClick={onOpen}
        />
        <Modal backdrop="opaque" isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Your Comment</ModalHeader>
                <ModalBody className="p-4">
                    <Typography>{comment}</Typography>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>);
};

const RequestCard = () => {
    const {formData, setFormData} = useFormTable<RequestFormWithMethod>();
    const isClient = useIsClient();
    const [items, setItems] = useState<RequestFormTableType[]>(() => {
        if (typeof window !== "undefined") {
            const savedItems = localStorage.getItem('requestItems');
            return savedItems ? JSON.parse(savedItems) : [];
        }
        return [];
    });

    // Update items when formData changes
    useEffect(() => {
        if (formData?.method === "Add") {
            const newItem: RequestFormTableType = {
                ...formData.data
            }
            setItems(prevItems => {
                const exists = prevItems.some(item => item.id === newItem.id);
                if (!exists) {
                    const updatedItems = [newItem, ...prevItems];
                    localStorage.setItem('requestItems', JSON.stringify(updatedItems));
                    return updatedItems;
                }
                return prevItems;
            });
        } else if (formData?.method === "Edit") {
            setItems(prevItems => {
                const updatedItems = prevItems.map(item => {
                    if (item.id === formData.data.id) {
                        return formData.data;
                    }
                    return item;
                });
                localStorage.setItem('requestItems', JSON.stringify(updatedItems));
                return updatedItems;
            });
        }
    }, [formData]);

    // Save items to localStorage whenever items change
    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem('requestItems', JSON.stringify(items));
        }
    }, [items]);

    // Handle clear items
    const handleClear = () => {
        setFormData({
            method: "Reset",
            data: {
                department: '',
                created_by: {
                    name: '',
                    picture: ''
                },
                comment: '',
                reason: '',
                leave_id: 0,
                id: 0,
                name: '',
                picture: '',
                leave_type: '',
                start_date: '',
                end_date: '',
                total_days: 0
            }
        })
        localStorage.removeItem('requestItems');
        setItems([]);
    };

    // Handle delete item
    const handleDelete = (id: number) => {
        setItems(prevItems => {
            const updatedItems = prevItems.filter(item => item.id !== id);
            localStorage.setItem('requestItems', JSON.stringify(updatedItems));
            return updatedItems;
        });
    }

    const CardsMemo = useMemo(() => {
        return <Cards items={items} onDelete={handleDelete}/>; // Pass handleDelete as the onDelete prop
    }, [items]);

    if (!isClient) return <div className="h-full w-full"><Loading/></div>;

    return (<div className="grid grid-rows-[repeat(1,1fr)] gap-4 w-full overflow-hidden">
        <Switch expression={String(items.length)}>
            <Case of="0">
                <div className="grid place-items-center">
                    <Typography className="font-semibold text-default-400/50">No Requests</Typography>
                </div>
            </Case>
            <Default>
                <ScrollShadow className="grid grid-cols-3 gap-4 p-4 pb-5">
                    {CardsMemo}
                </ScrollShadow>
            </Default>
        </Switch>

        <div className="w-full flex justify-end gap-4">
            <Button
                variant="flat"
                isDisabled={items.length === 0}
                radius="sm"
                size="sm"
                onClick={handleClear}
            >
                Clear All
            </Button>
            <Button
                isDisabled={items.length === 0}
                radius="sm"
                size="sm"
                color="primary"
            >
                Submit
            </Button>
        </div>
    </div>);
};

export default RequestCard;