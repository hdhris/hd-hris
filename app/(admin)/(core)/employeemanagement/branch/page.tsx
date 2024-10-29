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
import showDialog from "@/lib/utils/confirmDialog";

const Page: React.FC = () => {
  const { data: branches, error, mutate } = useBranchesData();
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<Branch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//
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
    setSelectedBranchId(branch);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string ) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/branch?id=${id}`);
        
         toast({
          title: "Deleted",
          description: "Employee deleted successfully!",
          variant: "warning",
        });
        await mutate();
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again." + error,
        duration: 3000,
      });
    }
  };


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
              onDelete={() => handleDelete(item.id, `${item.name}`)}
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

  const FilterItems = [
    {
      category: "Status",
      filtered: [
        { key: "is_active", value: true, name: "Active", uid: "active" },
        { key: "is_active", value: false, name: "Inactive", uid: "inactive" },
      ],
    },
  ];

  return (
    <div id="branch-page" className="h-fit-navlayout">
      <TableData
        aria-label="Branch Table"
        config={config}
        items={branches || []}
        filterItems={FilterItems}
        searchingItemKey={searchingItemKey}
        counterName="Branches"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        endContent={() => (
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddBranch onBranchAdded={handleBranchUpdated} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        )}
      />

      {selectedBranchId !== null && (
        <EditBranch
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          branchData={selectedBranchId}
          onBranchUpdated={handleBranchUpdated}
        />
      )}
    </div>
  );
};

export default Page;
