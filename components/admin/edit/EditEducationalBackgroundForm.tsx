import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { SharedSelection } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { Download, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Certificate {
  fileName: string;
  fileUrl: string;
}

const EditEducationalBackgroundForm = () => {
  const { control, watch, setValue, getValues } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();
  const [select, setSelect] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const { toast } = useToast(); // Importing toast from useToast

  // Watch form fields
  const elementary = watch("elementary");
  const highSchool = watch("highSchool");
  const seniorHighSchool = watch("seniorHighSchool");
  const universityCollege = watch("universityCollege");
  const seniorHighStrand = watch("seniorHighStrand");

  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
  }, [seniorHighSchool]);

  useEffect(() => {
    const initialSelect = seniorHighStrand || null;
    setSelect(initialSelect);
    setShowCourse(initialSelect === "tvl");
  }, [seniorHighStrand]);

  useEffect(() => {
    setShowCourse(select === "tvl");
  }, [select]);

  useEffect(() => {
    let highestDegree = "Elementary School";
    if (highSchool) highestDegree = "High School";
    if (seniorHighSchool) highestDegree = "Senior High School";
    if (universityCollege) highestDegree = "University/College";
    setValue("highestDegree", highestDegree);
  }, [elementary, highSchool, seniorHighSchool, universityCollege, setValue]);

  useEffect(() => {
    // Load existing certificates from form data
    const existingCertificates = getValues("certificates") || [];
    setCertificates(existingCertificates);
  }, [getValues]);

  const handleSelect = (keys: SharedSelection) => {
    const value = Array.from(keys)[0] as string;
    setSelect(value);
    setValue("seniorHighStrand", value);
  };

  useEffect(() => {
    // Load existing certificates from form data
    const existingCertificates = getValues("certificates") || [];
    setCertificates(existingCertificates);
  }, [getValues]);

  // Function to handle file progress updates
  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setFileStates((prevFileStates) => {
      const newFileStates = prevFileStates.map((fileState) =>
        fileState.key === key ? { ...fileState, progress } : fileState
      );
      return newFileStates;
    });
  }

  // Handle file download
  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "danger", // Use "danger" variant instead of "destructive"
      });
    }
  };

  // Handle file removal
  const handleRemove = async (index: number) => {
    try {
      const updatedCertificates = [...certificates];
      const removedCertificate = updatedCertificates.splice(index, 1)[0];

      if (removedCertificate.fileUrl) {
        // Remove file from EdgeStore
        await edgestore.publicFiles.delete({
          url: removedCertificate.fileUrl,
        });
      }

      setCertificates(updatedCertificates);
      setValue("certificates", updatedCertificates);
      toast({
        title: "Success",
        description: "File removed successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error removing file:", error);
      toast({
        title: "Error",
        description: "Failed to remove file. Please try again.",
        variant: "danger", // Use "danger" variant instead of "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Elementary School */}
        <FormField
          name="elementary"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Elementary School</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter Elementary School"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* High School */}
        <FormField
          name="highSchool"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>High School</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter High School"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Senior High School */}
        <FormField
          name="seniorHighSchool"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senior High School</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter Senior High School"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Senior High Strand */}
        {showStrand && (
          <FormField
            name="seniorHighStrand"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senior High School Strand</FormLabel>
                <FormControl>
                  <Select
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      handleSelect(keys);
                      const value = Array.from(keys)[0];
                      field.onChange(value);
                    }}
                    placeholder="Select Strand"
                    variant="bordered"
                    className="border rounded"
                  >
                    <SelectItem key="humss" value="HUMSS">
                      HUMSS
                    </SelectItem>
                    <SelectItem key="abm" value="ABM">
                      ABM
                    </SelectItem>
                    <SelectItem key="stem" value="STEM">
                      STEM
                    </SelectItem>
                    <SelectItem key="gas" value="GAS">
                      GAS
                    </SelectItem>
                    <SelectItem key="tvl" value="TVL">
                      TVL
                    </SelectItem>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* TVL Course */}
        {showCourse && (
          <FormField
            name="tvlCourse"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>TVL Course</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter TVL Course"
                    variant="bordered"
                    className="border rounded"
                    isRequired
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* University/College */}
        <FormField
          name="universityCollege"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>University/College</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter University/College"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course */}
        {universityCollege && (
          <FormField
            name="course"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter Course"
                    variant="bordered"
                    className="border rounded"
                    isRequired
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <FormField
          name="highestDegree"
          control={control}
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Highest Degree Attainment</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Highest Degree"
                  variant="bordered"
                  className="border rounded"
                  isReadOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      {/* File Upload Section */}
      <div className="space-y-4">
        <FormLabel>Certificates</FormLabel>
        <FormField
          name="certificates"
          control={control}
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormControl>
                <FileDropzone
                  value={fileStates}
                  onChange={(files) => {
                    setFileStates(files);
                    field.onChange(files.map((f) => f.file)); // Here, 'field' is correctly used
                  }}
                  onFilesAdded={async (addedFiles) => {
                    setFileStates([...fileStates, ...addedFiles]);
                    await Promise.all(
                      addedFiles.map(async (addedFileState) => {
                        try {
                          const res = await edgestore.publicFiles.upload({
                            file: addedFileState.file,
                            onProgressChange: async (progress) => {
                              updateFileProgress(addedFileState.key, progress);
                              if (progress === 100) {
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 1000)
                                );
                                updateFileProgress(
                                  addedFileState.key,
                                  "COMPLETE"
                                );
                              }
                            },
                          });
                          console.log(res);
                          const newCertificate: Certificate = {
                            fileName: addedFileState.file.name,
                            fileUrl: res.url,
                          };
                          const updatedCertificates = [
                            ...certificates,
                            newCertificate,
                          ];
                          setCertificates(updatedCertificates);
                          setValue("certificates", updatedCertificates);
                        } catch (err) {
                          console.error(err);
                          updateFileProgress(addedFileState.key, "ERROR");
                          toast({
                            title: "Error",
                            description:
                              "Failed to upload file. Please try again.",
                            variant: "danger",
                          });
                        }
                      })
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* {certificates.length > 0 && (
          <div className="space-y-2">
            {certificates.map((certificate, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>{certificate.fileName}</div>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(certificate.fileUrl, certificate.fileName)
                    }
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    color="danger" // Replace color="danger" with variant="danger"
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default EditEducationalBackgroundForm;
