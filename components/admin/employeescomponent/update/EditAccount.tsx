import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@nextui-org/react";
import axios from "axios";

interface EditAccountProps {
  userId: string;
  email: string;
  hasAccount: boolean;
}

const EditAccount: React.FC<EditAccountProps> = ({
  userId,
  email,
  hasAccount,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);

      // Make sure to send resetPassword: true in the payload
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${userId}&type=account`,
        {
          resetPassword: true
        }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Password has been reset and email sent with new credentials",
          duration: 3000,
        });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred";
      
      if (error.response?.status === 404) {
        errorMessage = "Employee not found";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "danger",
        duration: 5000,
      });
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Account Information</h2>
        {hasAccount && (
          <Button
            type="button"
            onPress={handleResetPassword}
            variant="bordered"
            isDisabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Associated Email: {email}</p>
        <p className="text-sm text-gray-500">
          Account Status: {hasAccount ? "Active" : "No Account"}
        </p>
        {!hasAccount && (
          <p className="text-sm text-muted-foreground mt-2">
            An account will be created automatically with the selected access level when you update the employee information.
          </p>
        )}
      </div>
    </div>
  );
};

export default EditAccount;