"use client";
import React, { useEffect, useState } from "react";
import { useBranchesData } from "@/services/queries";
import { Branch } from "@/types/employeee/BranchType";
import { Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddBranch from "@/components/admin/employeescomponent/store/AddBranch";
import EditBranch from "@/components/admin/employeescomponent/update/EditBranch";
import axios from "axios";
import addressData from "@/components/common/forms/address/address.json";
import showDialog from "@/lib/utils/confirmDialog";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
//
const Page: React.FC = () => {
  const { data: branches, error, mutate } = useBranchesData();
  const [sortedBranches, setSortedBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<Branch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (branches) {
      const sorted = sortBranchesByRecentActivity(branches);
      setSortedBranches(sorted);
    }
  }, [branches]);

  const sortBranchesByRecentActivity = (branches: Branch[]) => {
    return [...branches].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddBranch onBranchAdded={handleBranchUpdated} />
    </div>
  ));

  const handleEdit = async (branch: Branch) => {
    setSelectedBranchId(branch);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      
      if (result === "yes") {
        const response = await axios.delete(`/api/employeemanagement/branch?id=${id}`);
        
        toast({
          title: "Success",
          description: "Branch deleted successfully!",
          variant: "warning",
        });
        
        await mutate();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "Error",
          description: error.response.data.message || "There are employees currently work with this branch",
          variant: "danger",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "danger",
        });
      }
    }
  };

  const handleBranchUpdated = async () => {
    try {
      const updatedData = await mutate();
      if (updatedData) {
        const sorted = sortBranchesByRecentActivity(updatedData);
        setSortedBranches(sorted);
      }
    } catch (error) {
      console.error("Error updating branch data:", error);
    }
  };

  const getMunicipalityName = (municipalityId: number | null): string => {
    if (!municipalityId) return "Unknown";
    const municipality = addressData.find(
      (addr) => addr.address_code === municipalityId
    );
    return municipality ? municipality.address_name : "Unknown";
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      {
        uid: "municipality",
        name: "Municipality",
        sortable: true,
      },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (branch: Branch, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";

      switch (key) {
        case "name":
          return (
            <div className={cellClasses}>
              <span>{branch.name}</span>
            </div>
          );
        case "municipality":
          return (
            <div className={cellClasses}>
              {getMunicipalityName(branch.addr_municipal)}
            </div>
          );
        case "status":
          return (
            <div className={cellClasses}>
              <Chip
                className="capitalize"
                color={branch.is_active ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {branch.is_active ? "Active" : "Inactive"}
              </Chip>
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={branch.name ?? "Unknown"}
              onEdit={() => handleEdit(branch)}
              onDelete={() => handleDelete(branch.id, `${branch.name}`)}
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const sortProps = {
    sortItems: [
      { name: "Name", key: "name" as keyof Branch },
      {
        name: "Created",
        key: "created_at" as keyof Branch,
      },
      { name: "Updated", key: "updated_at" as keyof Branch },
    ],
  };

  const FilterItems = [
    {
      category: "Status",
      filtered: [
        { key: "is_active", value: true, name: "Active", uid: "active" },
        {
          key: "is_active",
          value: false,
          name: "Inactive",
          uid: "inactive",
        },
      ],
    },
  ];

  return (
    <div  className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        isLoading={!branches && !error}
        defaultDisplay="table"
        title="Branches"
        data={sortedBranches}
        filterProps={{
          filterItems: FilterItems,
        }}
        onTableDisplay={{
          config: TableConfigurations,
          layout: "auto",
          className: "h-full overflow-auto",
        }}
        searchProps={{
          searchingItemKey: ["name"],
        }}
        sortProps={sortProps}
        onListDisplay={(branch) => (
          <div className="w-full">
            <BorderCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{branch.name}</span>
                  <span className="text-sm text-gray-500">
                    {getMunicipalityName(branch.addr_municipal)}
                  </span>
                </div>
                <Chip
                  className="capitalize"
                  color={branch.is_active ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {branch.is_active ? "Active" : "Inactive"}
                </Chip>
              </div>
            </BorderCard>
          </div>
        )}
        paginationProps={{
          data_length: branches?.length,
        }}
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
