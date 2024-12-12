import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { SharedSelection } from "@nextui-org/react";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { Divider } from "@nextui-org/react";
import Text from "@/components/Text";
import { Button } from "@nextui-org/button";
import { useToast } from "@/components/ui/use-toast";

const EditEducationalBackgroundForm = () => {
  const formContext = useFormContext();
  const { watch, setValue, getValues } = formContext;
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [showTVLCourse, setShowTVLCourse] = useState(false);
  const [basicFileStates, setBasicFileStates] = useState<FileState[]>([]);
  const [mastersFileStates, setMastersFileStates] = useState<FileState[]>([]);
  const [doctorateFileStates, setDoctorateFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();
  const [select, setSelect] = useState<string>("");
  const [certificates, setCertificates] = useState<(string | File)[]>([]);
  const [mastersCertificates, setMastersCertificates] = useState<(string | File)[]>([]);
  const [doctorateCertificates, setDoctorateCertificates] = useState<(string | File)[]>([]);
  const { toast } = useToast();

  const elementary = watch("elementary");
  const highSchool = watch("highSchool");
  const seniorHighSchool = watch("seniorHighSchool");
  const seniorHighStrand = watch("seniorHighStrand");
  const universityCollege = watch("universityCollege");
  const masters = watch("masters");
  const doctorate = watch("doctorate");

  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
    setShowTVLCourse(seniorHighStrand === "TVL");
  }, [seniorHighSchool, seniorHighStrand]);

  useEffect(() => {
    setShowCourse(!!universityCollege);
  }, [universityCollege]);

  useEffect(() => {
    let highestDegree = "Nothing Input";
    if (elementary) highestDegree = "Elementary";
    if (highSchool) highestDegree = "High School";
    if (seniorHighSchool) highestDegree = "Senior High School";
    if (universityCollege) highestDegree = "University/College";
    if (masters) highestDegree = "Masters";
    if (doctorate) highestDegree = "Doctorate";
    setValue("highestDegree", highestDegree);
  }, [
    elementary,
    highSchool,
    seniorHighSchool,
    universityCollege,
    masters,
    doctorate,
    setValue,
  ]);

  useEffect(() => {
    const existingCertificates = (getValues("certificates") || [])
      .map((cert: any) =>
        cert
          ? typeof cert === "string"
            ? cert
            : cert.fileUrl || cert.url
          : null
      )
      .filter(Boolean); 

    const existingMastersCertificates = (getValues("mastersCertificates") || [])
      .map((cert: any) =>
        cert
          ? typeof cert === "string"
            ? cert
            : cert.fileUrl || cert.url
          : null
      )
      .filter(Boolean);

    const existingDoctorateCertificates = (
      getValues("doctorateCertificates") || []
    )
      .map((cert: any) =>
        cert
          ? typeof cert === "string"
            ? cert
            : cert.fileUrl || cert.url
          : null
      )
      .filter(Boolean);

    const createFileStates = (urls: string[]) =>
      urls.map((url) => ({
        key: url ? url.split("/").pop() || "unknown" : "unknown",
        file: new File([], url ? url.split("/").pop() || "unknown" : "unknown"),
        progress: "COMPLETE" as const,
      }));

    setBasicFileStates(createFileStates(existingCertificates));
    setMastersFileStates(createFileStates(existingMastersCertificates));
    setDoctorateFileStates(createFileStates(existingDoctorateCertificates));

    setCertificates(existingCertificates);
    setMastersCertificates(existingMastersCertificates);
    setDoctorateCertificates(existingDoctorateCertificates);
  }, [getValues]);

  function updateFileProgress(
    key: string,
    progress: FileState["progress"],
    fileType: "basic" | "masters" | "doctorate"
  ) {
    const setFileStates = {
      basic: setBasicFileStates,
      masters: setMastersFileStates,
      doctorate: setDoctorateFileStates,
    }[fileType];

    setFileStates((currentFileStates) => {
      const newFileStates = structuredClone(currentFileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  const handleSelect = (key: SharedSelection) => {
    if (key.anchorKey === "tvl") {
      setSelect(key as string);
      setShowTVLCourse(true);
    } else {
      setSelect("");
      setShowTVLCourse(false);
    }
  };

  const handleRemove = (
    index: number,
    certificateType: "basic" | "masters" | "doctorate"
  ) => {
    switch (certificateType) {
      case "masters":
        const updatedMastersCerts = [...mastersCertificates];
        updatedMastersCerts.splice(index, 1);
        setMastersCertificates(updatedMastersCerts);
        setValue("mastersCertificates", updatedMastersCerts);
        setMastersFileStates((prev) => prev.filter((_, i) => i !== index));
        break;
      case "doctorate":
        const updatedDoctorateCerts = [...doctorateCertificates];
        updatedDoctorateCerts.splice(index, 1);
        setDoctorateCertificates(updatedDoctorateCerts);
        setValue("doctorateCertificates", updatedDoctorateCerts);
        setDoctorateFileStates((prev) => prev.filter((_, i) => i !== index));
        break;
      default:
        const updatedCerts = [...certificates];
        updatedCerts.splice(index, 1);
        setCertificates(updatedCerts);
        setValue("certificates", updatedCerts);
        setBasicFileStates((prev) => prev.filter((_, i) => i !== index));
    }

    toast({
      title: "Success",
      description: "File removed from the list",
      variant: "success",
    });
  };

  const handleFileUpload = async (
    addedFiles: FileState[],
    certificateType: "basic" | "masters" | "doctorate"
  ) => {
    // Update file states with the actual files
    switch (certificateType) {
      case "masters":
        setMastersFileStates((prev) => [...prev, ...addedFiles]);
        break;
      case "doctorate":
        setDoctorateFileStates((prev) => [...prev, ...addedFiles]);
        break;
      default:
        setBasicFileStates((prev) => [...prev, ...addedFiles]);
    }

    const uploadPromises = addedFiles.map(async (addedFileState) => {
      try {
        if (!addedFileState.file || !(addedFileState.file instanceof File)) {
          throw new Error("Invalid file");
        }

        const fileData = new File(
          [addedFileState.file],
          addedFileState.file.name,
          {
            type: addedFileState.file.type,
          }
        );

        const result = await edgestore.publicFiles.upload({
          file: fileData,
          options: {
            temporary: false,
          },
          onProgressChange: async (progress) => {
            updateFileProgress(addedFileState.key, progress, certificateType);
            if (progress === 100) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              updateFileProgress(
                addedFileState.key,
                "COMPLETE",
                certificateType
              );
            }
          },
        });

        switch (certificateType) {
          case "masters": {
            setMastersCertificates((prev) => [...prev, result.url]);
            setValue(
              "mastersCertificates",
              getValues("mastersCertificates").concat(result.url)
            );
            break;
          }
          case "doctorate": {
            setDoctorateCertificates((prev) => [...prev, result.url]);
            setValue(
              "doctorateCertificates",
              getValues("doctorateCertificates").concat(result.url)
            );
            break;
          }
          default: {
            setCertificates((prev) => [...prev, result.url]);
            setValue(
              "certificates",
              getValues("certificates").concat(result.url)
            );
            break;
          }
        }

        return result.url;
      } catch (err) {
        console.error("File upload error:", err);
        updateFileProgress(addedFileState.key, "ERROR", certificateType);
        toast({
          title: "Error",
          description: `Failed to upload ${addedFileState.file.name}. Please try again.`,
          variant: "danger",
        });
      }
    });

    try {
      await Promise.all(uploadPromises);
    } catch (err) {
      console.error("Upload process error:", err);
    }
  };

  // Form fields configuration remains the same...
  const formFields: FormInputProps[] = [
    {
      name: "elementary",
      label: "Elementary",
      type: "text",
      placeholder: "Enter Elementary School",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "highSchool",
      label: "High School",
      type: "text",
      placeholder: "Enter High School",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "seniorHighSchool",
      label: "Senior High School",
      type: "text",
      placeholder: "Enter Senior High School",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "seniorHighStrand",
      label: "Senior High School Strand",
      type: "auto-complete",
      isVisible: showStrand,
      placeholder: "Select Strand",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
        options: [
          { value: "HUMSS", label: "HUMSS" },
          { value: "ABM", label: "ABM" },
          { value: "STEM", label: "STEM" },
          { value: "GAS", label: "GAS" },
          { value: "TVL", label: "TVL" },
        ],
        onSelectionChange: handleSelect,
      },
    },
    {
      name: "tvlCourse",
      label: "TVL Course",
      type: "text",
      isVisible: select === "tvl",
      placeholder: "Enter TVL Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "universityCollege",
      label: "University/College",
      type: "text",
      placeholder: "Enter University/College",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "course",
      label: "Course",
      type: "text",
      isVisible: showCourse,
      placeholder: "Enter Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "masters",
      label: "Masters",
      type: "text",
      placeholder: "Enter Masters Institution",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "mastersCourse",
      label: "Masters Course",
      type: "text",
      isVisible: !!masters,
      placeholder: "Enter Masters Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "mastersYear",
      label: "Masters Graduated Academic Year",
      type: "text",
      isVisible: !!masters,
      placeholder: "Enter Year (e.g., 2021-2022)",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "doctorate",
      label: "Doctorate",
      type: "text",
      placeholder: "Enter Doctorate Institution",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "doctorateCourse",
      label: "Doctorate Course",
      type: "text",
      isVisible: !!doctorate,
      placeholder: "Enter Doctorate Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "doctorateYear",
      label: "Doctorate Year",
      type: "text",
      isVisible: !!doctorate,
      placeholder: "Enter Year (e.g., 2021-2022)",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "highestDegree",
      label: "Highest Degree Attainment",
      type: "text",
      config: {
        variant: "bordered",
        isReadOnly: true,
      },
    },
  ];

  if (!formContext) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormFields items={formFields} />
      </div>

      {/* Basic Certificates */}
      <Divider />
      <Text className="text-medium font-semibold">Certificates</Text>
      {certificates?.length > 0 && (
        <div className="space-y-2">
          {certificates.map((certificate, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                {certificate
                  ? typeof certificate === "string"? certificate.split("/").pop() || "Unknown"
                  : certificate instanceof File
                  ? certificate.name
                  : "Unknown file"
                : "Unknown file"}
            </div>
            <div className="space-x-2">
              {certificate && typeof certificate === "string" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(certificate, "_blank")}
                >
                  Download
                </Button>
              )}
              <Button
                color="danger"
                size="sm"
                onClick={() => handleRemove(index, "basic")}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
    <FormFields
      items={[
        {
          name: "certificates",
          label: "Basic Certificates",
          type: "text",
          Component: ({ onChange }) => (
            <FileDropzone
              value={basicFileStates}
              onChange={(files) => {
                setBasicFileStates(files);
                onChange(files.map((f) => f.file));
              }}
              onFilesAdded={(addedFiles) =>
                handleFileUpload(addedFiles, "basic")
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
  
    {/* Masters Certificates */}
    {masters && (
      <>
        <Divider />
        <Text className="text-medium font-semibold">
          Masters Certificates
        </Text>
        {/* Masters Certificates */}
        {masters && mastersCertificates?.length > 0 && (
          <div className="space-y-2">
            {mastersCertificates.map((certificate, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  {certificate
                    ? typeof certificate === "string"
                      ? certificate.split("/").pop() || "Unknown"
                      : certificate instanceof File
                      ? certificate.name
                      : "Unknown file"
                    : "Unknown file"}
                </div>
                <div className="space-x-2">
                  {certificate && typeof certificate === "string" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(certificate, "_blank")}
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleRemove(index, "masters")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <FormFields
          items={[
            {
              name: "mastersCertificates",
              label: "Masters Certificates",
              type: "text",
              Component: ({ onChange }) => (
                <FileDropzone
                  value={mastersFileStates}
                  onChange={(files) => {
                    setMastersFileStates(files);
                    onChange(files.map((f) => f.file));
                  }}
                  onFilesAdded={(addedFiles) =>
                    handleFileUpload(addedFiles, "masters")
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
      </>
    )}
  
    {/* Doctorate Certificates */}
    {doctorate && (
      <>
        <Divider />
        <Text className="text-medium font-semibold">
          Doctorate Certificates
        </Text>
        {/* Doctorate Certificates */}
        {doctorate && doctorateCertificates?.length > 0 && (
          <div className="space-y-2">
            {doctorateCertificates.map((certificate, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  {certificate
                    ? typeof certificate === "string"
                      ? certificate.split("/").pop() || "Unknown"
                      : certificate instanceof File
                      ? certificate.name
                      : "Unknown file"
                    : "Unknown file"}
                </div>
                <div className="space-x-2">
                  {certificate && typeof certificate === "string" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(certificate, "_blank")}
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleRemove(index, "doctorate")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <FormFields
          items={[
            {
              name: "doctorateCertificates",
              label: "Doctorate Certificates",
              type: "text",
              Component: ({ onChange }) => (
                <FileDropzone
                  value={doctorateFileStates}
                  onChange={(files) => {
                    setDoctorateFileStates(files);
                    onChange(files.map((f) => f.file));
                  }}
                  onFilesAdded={(addedFiles) =>
                    handleFileUpload(addedFiles, "doctorate")
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
      </>
    )}
  </div>
  );
  //
};
//
export default EditEducationalBackgroundForm;
