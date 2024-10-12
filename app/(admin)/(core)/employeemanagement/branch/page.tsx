"use client";
import React, { useEffect, useState } from "react";
import TableData from "@/components/tabledata/TableData";
import { TableActionButton } from "@/components/actions/ActionButton";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toast } from "@/components/ui/use-toast";
import AddBranch from "@/components/admin/add/AddBranch";
import EditBranch from "@/components/admin/edit/EditBranch";
import { useBranchesData } from "@/services/queries";
import { Branch } from "@/types/employeee/BranchType";
import axios from "axios";
import addressData from "@/components/common/forms/address/address.json";
import { Chip } from "@nextui-org/react";

const Page: React.FC = () => {
  const { data: branches, error, mutate } = useBranchesData();
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (branches) {
      setLoading(false);
    }
  }, [branches]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch branches. Please try again.",
        duration: 3000,
      });
      setLoading(false);
    }
  }, [error]);

  const handleEdit = async (branch: Branch) => {
    setSelectedBranchId(branch.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/employeemanagement/branch?id=${id}`);
      setDeleteSuccess(true);
      await mutate();
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again.",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (!loading && deleteSuccess) {
      toast({
        title: "Success",
        description: "Branch successfully deleted!",
        duration: 3000,
      });
      setDeleteSuccess(false);
    }
  }, [loading, deleteSuccess]);

  const getMunicipalityName = (municipalityId: number | null): string => {
    if (!municipalityId) return "Unknown";
    const municipality = addressData.find(
      (addr) => addr.address_code === municipalityId
    );
    return municipality ? municipality.address_name : "Unknown";
  };

  const config: TableConfigProps<Branch> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "municipality", name: "Municipality", sortable: false },
      { uid: "is_active", name: "Status", sortable: true },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return <span>{item.name}</span>;
        case "municipality":
          return <span>{getMunicipalityName(item.addr_municipal)}</span>;
        case "is_active":
          return (
            <Chip
              className="capitalize"
              color={item.is_active ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {item.is_active ? "Active" : "Inactive"}
            </Chip>
          );
        case "actions":
          return (
            <TableActionButton
              name={item.name ?? "Unknown"}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey: (keyof Branch)[] = ["name"];

  const handleBranchUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating branch list:", error);
    }
  };

  return (
    <div id="branch-page" className="mt-2">
      <TableData
        aria-label="Branch Table"
        config={config}
        items={branches || []}
        searchingItemKey={searchingItemKey}
        counterName="Branches"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        contentTop={
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddBranch onBranchAdded={handleBranchUpdated} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        }
      />

      {selectedBranchId !== null && (
        <EditBranch
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          branchId={selectedBranchId}
          onBranchUpdated={handleBranchUpdated}
        />
      )}
    </div>
  );
};

export default Page;