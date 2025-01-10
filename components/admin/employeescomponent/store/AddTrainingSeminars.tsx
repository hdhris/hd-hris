import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import Text from "@/components/Text";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import TrainingAddressInput from "../TrainingAddressInput";

interface TrainingState {
  fileStates: FileState[];
  certificates: (string | File)[];
}

const AddTrainingSeminars = () => {
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();
  const { setValue, getValues } = useFormContext();
  const [trainingStates, setTrainingStates] = useState<TrainingState[]>([
    { fileStates: [], certificates: [] },
  ]);
  const [trainingCount, setTrainingCount] = useState(1);

  useEffect(() => {
    const existingTrainings = getValues("trainings") || [];

    if (existingTrainings.length > 0) {
      const initialStates = existingTrainings.map((training: any) => {
        const certificates = training.training_certificates || [];

        const createFileState = (certificate: string | File): FileState => {
          const fileName =
            typeof certificate === "string"
              ? certificate.split("/").pop() || certificate
              : certificate.name;

          return {
            key: fileName,
            file: new File([], fileName),
            progress: "COMPLETE",
          };
        };

        return {
          fileStates: certificates.map(createFileState),
          certificates: certificates,
        };
      });

      setTrainingStates(initialStates);
      setTrainingCount(existingTrainings.length);
    }
  }, [getValues]);

  const handleRemoveCertificate = (
    trainingIndex: number,
    certIndex: number
  ) => {
    // Create copies of current states
    const updatedStates = [...trainingStates];
    const currentTraining = updatedStates[trainingIndex];

    // Remove certificate from local state
    const updatedCerts = [...currentTraining.certificates];
    updatedCerts.splice(certIndex, 1);

    // Update training state
    updatedStates[trainingIndex] = {
      ...currentTraining,
      certificates: updatedCerts,
      fileStates: currentTraining.fileStates.filter((_, i) => i !== certIndex),
    };

    // Update local state
    setTrainingStates(updatedStates);

    // Update form values
    const currentTrainings = getValues("trainings") || [];
    if (currentTrainings[trainingIndex]) {
      currentTrainings[trainingIndex].training_certificates = updatedCerts;
      setValue("trainings", currentTrainings);
    }

    // Show success toast
    toast({
      title: "Success",
      description: "File removed from the list",
      variant: "success",
    });
  };

  const handleFileUpload = async (
    addedFiles: FileState[],
    trainingIndex: number
  ) => {
    // Ensure trainings array exists and has the correct length
    const currentTrainings = getValues("trainings") || [];

    // Ensure the specific training entry exists
    if (!currentTrainings[trainingIndex]) {
      currentTrainings[trainingIndex] = {};
    }

    // Ensure training_certificates exists
    if (!currentTrainings[trainingIndex].training_certificates) {
      currentTrainings[trainingIndex].training_certificates = [];
    }

    // Create local states for the specific training
    const updatedStates = [...trainingStates];
    const currentTraining = updatedStates[trainingIndex];

    // Check for existing files to prevent duplicates
    const existingUrls = new Set(
      currentTraining.certificates.map((cert) =>
        typeof cert === "string" ? cert : cert.name
      )
    );

    // Filter out already uploaded files
    const newFiles = addedFiles.filter(
      (file) => !existingUrls.has(file.file?.name || "")
    );

    // Warn if no new files
    if (newFiles.length === 0) {
      toast({
        title: "Warning",
        description: "These files have already been uploaded",
        variant: "warning",
      });
      return;
    }

    // Update file states for this specific training
    updatedStates[trainingIndex] = {
      ...currentTraining,
      fileStates: [...currentTraining.fileStates, ...newFiles],
    };

    // Upload promises for new files
    const uploadPromises = newFiles.map(async (fileState) => {
      try {
        // Validate file
        if (!fileState.file || !(fileState.file instanceof File)) {
          throw new Error("Invalid file");
        }

        // Upload file
        const result = await edgestore.publicFiles.upload({
          file: fileState.file,
          options: {
            temporary: false,
          },
          onProgressChange: async (progress) => {
            // Update file state progress
            updatedStates[trainingIndex].fileStates = updatedStates[
              trainingIndex
            ].fileStates.map((state) =>
              state.key === fileState.key ? { ...state, progress } : state
            );
            setTrainingStates([...updatedStates]);

            // Mark as complete after upload
            if (progress === 100) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              updatedStates[trainingIndex].fileStates = updatedStates[
                trainingIndex
              ].fileStates.map((state) =>
                state.key === fileState.key
                  ? { ...state, progress: "COMPLETE" }
                  : state
              );
              setTrainingStates([...updatedStates]);
            }
          },
        });

        // Add uploaded file URL to certificates
        const updatedCerts = [
          ...updatedStates[trainingIndex].certificates,
          result.url,
        ];
        updatedStates[trainingIndex].certificates = updatedCerts;

        // Update form values
        currentTrainings[trainingIndex] = {
          ...currentTrainings[trainingIndex],
          training_certificates: updatedCerts,
        };
        setValue("trainings", currentTrainings);

        // Update local state
        setTrainingStates([...updatedStates]);

        return result.url;
      } catch (err) {
        console.error("File upload error:", err);

        // Update file state to error
        updatedStates[trainingIndex].fileStates = updatedStates[
          trainingIndex
        ].fileStates.map((state) =>
          state.key === fileState.key ? { ...state, progress: "ERROR" } : state
        );
        setTrainingStates([...updatedStates]);

        // Show error toast
        toast({
          title: "Error",
          description: `Failed to upload ${fileState.file.name}. Please try again.`,
          variant: "danger",
        });

        throw err; // Rethrow to be caught by Promise.all
      }
    });

    // Wait for all uploads to complete
    try {
      await Promise.all(uploadPromises);
    } catch (err) {
      console.error("Upload process error:", err);
    }
  };

  const formFields: FormInputProps[] = [
    {
      name: "training_type",
      label: "Training Type",
      type: "select",
      placeholder: "Select if it is a seminar or training",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
        options: [
          { value: "training", label: "Training" },
          { value: "seminar", label: "Seminar" },
        ],
      },
    },
    {
      name: "training_title",
      label: "Title",
      type: "text",
      placeholder: "Enter the title",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "training_description",
      label: "Description",
      type: "text-area",
      placeholder: "Enter training description",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
        minRows: 3,
      },
    },
    {
      name: "training_venue",
      label: "Venue",
      type: "text",
      placeholder: "Enter venue",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "training_conductor",
      label: "Conductor",
      type: "text",
      placeholder: "Enter conductor name",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "training_startDate",
      label: "Start Date",
      type: "date-picker",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "training_endDate",
      label: "End Date",
      type: "date-picker",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "trainingDuration",
      label: "Duration",
      type: "number",
      placeholder: "Enter duration",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "trainingDurationType",
      label: "Duration Type",
      type: "select",
      placeholder: "Select duration type",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
        options: [
          { value: "minutes", label: "minute(s)" },
          { value: "hour", label: "hour(s)" },
        ],
      },
    },
  ];

  const handleAddTraining = () => {
    setTrainingCount((prev) => prev + 1);
    setTrainingStates((prev) => [
      ...prev,
      { fileStates: [], certificates: [] },
    ]);
  };

  const handleRemoveTraining = (index: number) => {
    if (trainingCount > 1) {
      setTrainingCount((prev) => prev - 1);
      const updatedStates = trainingStates.filter((_, i) => i !== index);
      setTrainingStates(updatedStates);

      // Update form values
      const currentTrainings = getValues("trainings") || [];
      const updatedTrainings = currentTrainings.filter(
        (_: any, i: number) => i !== index
      );
      setValue("trainings", updatedTrainings);
    }
  };

  return (
    <div className="space-y-6">
      {trainingStates.map((trainingState, index) => (
        <div key={index}>
          {index > 0 && <Divider className="my-6" />}
          <div className="flex justify-between items-center mb-4">
            <Text className="text-lg font-medium">
              Training or Seminar Attended #{index + 1}
            </Text>
            {index > 0 && (
              <Button
                color="danger"
                variant="light"
                onPress={() => handleRemoveTraining(index)}
                startContent={<Trash2 className="w-4 h-4" />}
              >
                Remove Training
              </Button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-3/5">
              <div className="space-y-6">
                <FormFields
                  items={formFields.map((field) => ({
                    ...field,
                    name: `trainings.${index}.${String(field.name)}`,
                  }))}
                />
              </div>
              <div className="mt-4">
                Location
                <TrainingAddressInput index={index} />
              </div>
            </div>

            <div className="w-full lg:w-2/5">
              <div className="sticky top-4">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <Text className="text-medium font-semibold">Attachments</Text>
                  <Divider className="my-2" />

                  {trainingState.certificates.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {trainingState.certificates.map(
                        (certificate, certIndex) => (
                          <div
                            key={certIndex}
                            className="flex justify-between items-center"
                          >
                            <div>
                              {typeof certificate === "string"
                                ? certificate.split("/").pop()
                                : certificate instanceof File
                                ? certificate.name
                                : "Unknown file"}
                            </div>
                            <Button
                              color="danger"
                              size="sm"
                              onPress={() =>
                                handleRemoveCertificate(index, certIndex)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <FormFields
                    items={[
                      {
                        name: `trainings.${index}.training_certificates`,
                        label: "Training Certificates",
                        type: "text",
                        Component: ({ onChange }) => (
                          <FileDropzone
                            value={trainingState.fileStates}
                            onChange={(files) => {
                              const updatedStates = [...trainingStates];
                              updatedStates[index].fileStates = files;
                              setTrainingStates(updatedStates);
                              onChange(files.map((f) => f.file));
                            }}
                            onFilesAdded={(files) =>
                              handleFileUpload(files, index)
                            }
                            dropzoneOptions={{
                              accept: {
                                "application/pdf": [".pdf"],
                                "image/jpeg": [".jpg", ".jpeg"],
                                "image/png": [".png"],
                                "image/webp": [".webp"],
                              },
                              maxSize: 5 * 1024 * 1024,
                            }}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        color="primary"
        variant="light"
        onPress={handleAddTraining}
        startContent={<Plus className="w-4 h-4" />}
      >
        Add Another Training or Seminar
      </Button>
    </div>
  );
};

export default AddTrainingSeminars;
