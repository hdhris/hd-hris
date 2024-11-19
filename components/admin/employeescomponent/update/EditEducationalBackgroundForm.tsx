import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { SharedSelection } from "@nextui-org/react";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { Divider } from "@nextui-org/react";
import Text from "@/components/Text";
import { Button } from "@nextui-org/button";
import { useToast } from "@/components/ui/use-toast";

interface Certificate {
  fileName: string;
  fileUrl: string;
}

const EditEducationalBackgroundForm = () => {
  const { watch, setValue, getValues } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [basicFileStates, setBasicFileStates] = useState<FileState[]>([]);
  const [mastersFileStates, setMastersFileStates] = useState<FileState[]>([]);
  const [doctorateFileStates, setDoctorateFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();
  const [select, setSelect] = useState<string>("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [mastersCertificates, setMastersCertificates] = useState<Certificate[]>([]);
  const [doctorateCertificates, setDoctorateCertificates] = useState<Certificate[]>([]);
  const { toast } = useToast();

  // Watch form fields
  const elementary = watch("elementary");
  const highSchool = watch("highSchool");
  const seniorHighSchool = watch("seniorHighSchool");
  const universityCollege = watch("universityCollege");
  const masters = watch("masters");
  const doctorate = watch("doctorate");

  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
  }, [seniorHighSchool]);

  useEffect(() => {
    setShowCourse(!!universityCollege);
  }, [universityCollege]);

  useEffect(() => {
    let highestDegree = "Elementary School";
    if (highSchool) highestDegree = "High School";
    if (seniorHighSchool) highestDegree = "Senior High School";
    if (universityCollege) highestDegree = "University/College";
    if (masters) highestDegree = "Masters";
    if (doctorate) highestDegree = "Doctorate";
    setValue("highestDegree", highestDegree);
  }, [elementary, highSchool, seniorHighSchool, universityCollege, masters, doctorate, setValue]);

  useEffect(() => {
    // Load existing certificates from form data
    const existingCertificates = getValues("certificates") || [];
    const existingMastersCertificates = getValues("mastersCertificates") || [];
    const existingDoctorateCertificates = getValues("doctorateCertificates") || [];
    
    setCertificates(existingCertificates);
    setMastersCertificates(existingMastersCertificates);
    setDoctorateCertificates(existingDoctorateCertificates);
  }, [getValues]);

  function updateFileProgress(key: string, progress: FileState["progress"], fileType: 'basic' | 'masters' | 'doctorate') {
    const setFileStates = {
      basic: setBasicFileStates,
      masters: setMastersFileStates,
      doctorate: setDoctorateFileStates
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
    }
  };

  // Handle file removal for different certificate types
  const handleRemove = (index: number, certificateType: 'basic' | 'masters' | 'doctorate') => {
    let updatedCertificates: Certificate[];
    switch (certificateType) {
      case 'masters':
        updatedCertificates = [...mastersCertificates];
        updatedCertificates.splice(index, 1);
        setMastersCertificates(updatedCertificates);
        setValue("mastersCertificates", updatedCertificates);
        break;
      case 'doctorate':
        updatedCertificates = [...doctorateCertificates];
        updatedCertificates.splice(index, 1);
        setDoctorateCertificates(updatedCertificates);
        setValue("doctorateCertificates", updatedCertificates);
        break;
      default:
        updatedCertificates = [...certificates];
        updatedCertificates.splice(index, 1);
        setCertificates(updatedCertificates);
        setValue("certificates", updatedCertificates);
    }
    toast({
      title: "Success",
      description: "File removed from the list",
      variant: "success",
    });
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (addedFiles: FileState[], certificateType: 'basic' | 'masters' | 'doctorate') => {
    const fileStatesMap = {
      basic: { current: basicFileStates, setter: setBasicFileStates },
      masters: { current: mastersFileStates, setter: setMastersFileStates },
      doctorate: { current: doctorateFileStates, setter: setDoctorateFileStates }
    }[certificateType];

    fileStatesMap.setter([...fileStatesMap.current, ...addedFiles]);
    
    await Promise.all(
      addedFiles.map(async (addedFileState) => {
        try {
          const res = await edgestore.publicFiles.upload({
            file: addedFileState.file,
            onProgressChange: async (progress) => {
              updateFileProgress(addedFileState.key, progress, certificateType);
              if (progress === 100) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                updateFileProgress(addedFileState.key, "COMPLETE", certificateType);
              }
            },
          });
          
          const newCertificate: Certificate = {
            fileName: addedFileState.file.name,
            fileUrl: res.url,
          };

          switch (certificateType) {
            case 'masters':
              const updatedMastersCerts = [...mastersCertificates, newCertificate];
              setMastersCertificates(updatedMastersCerts);
              setValue("mastersCertificates", updatedMastersCerts);
              break;
            case 'doctorate':
              const updatedDoctorateCerts = [...doctorateCertificates, newCertificate];
              setDoctorateCertificates(updatedDoctorateCerts);
              setValue("doctorateCertificates", updatedDoctorateCerts);
              break;
            default:
              const updatedCerts = [...certificates, newCertificate];
              setCertificates(updatedCerts);
              setValue("certificates", updatedCerts);
          }
        } catch (err) {
          console.error(err);
          updateFileProgress(addedFileState.key, "ERROR", certificateType);
          toast({
            title: "Error",
            description: "Failed to upload file. Please try again.",
            variant: "danger",
          });
        }
      })
    );
  };

  const renderFileUploader = (name: string, certificateType: 'basic' | 'masters' | 'doctorate') => {
    const fileStatesMap = {
      basic: { current: basicFileStates, setter: setBasicFileStates },
      masters: { current: mastersFileStates, setter: setMastersFileStates },
      doctorate: { current: doctorateFileStates, setter: setDoctorateFileStates }
    }[certificateType];

    return (
      <FormFields
        items={[
          {
            name,
            label: `${certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} Certificates`,
            type: "text",
            Component: ({ onChange }) => (
              <FileDropzone
                value={fileStatesMap.current}
                onChange={(files) => {
                  fileStatesMap.setter(files);
                  onChange(files.map((f) => f.file));
                }}
                onFilesAdded={(addedFiles) => handleFileUpload(addedFiles, certificateType)}
              />
            ),
          },
        ]}
      />
    );
  };

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

  const renderCertificateList = (certificateList: Certificate[], type: 'basic' | 'masters' | 'doctorate') => (
    certificateList.length > 0 && (
      <div className="space-y-2">
        {certificateList.map((certificate, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>{certificate.fileName}</div>
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(certificate.fileUrl, certificate.fileName)}
              >
                Download
              </Button>
              <Button
                color="danger"
                size="sm"
                onClick={() => handleRemove(index, type)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormFields items={formFields} />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Basic Certificates</Text>
      {renderFileUploader("certificates", "basic")}
      {renderCertificateList(certificates, "basic")}

      {masters && (
        <>
          <Divider />
          <Text className="text-medium font-semibold">Masters Certificates</Text>
          {renderFileUploader("mastersCertificates", "masters")}
          {renderCertificateList(mastersCertificates, "masters")}
        </>
      )}

      {doctorate && (
        <>
          <Divider />
          <Text className="text-medium font-semibold">Doctorate Certificates</Text>
          {renderFileUploader("doctorateCertificates", "doctorate")}
          {renderCertificateList(doctorateCertificates, "doctorate")}
        </>
      )}
    </div>
  );
};

export default EditEducationalBackgroundForm;