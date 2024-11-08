import React from 'react';
import Image from 'next/image';
import { cn } from "@nextui-org/react";

// Static imports for each icon
import ai from '../../../public/assets/extensions/AI.svg';
import avi from '../../../public/assets/extensions/AVI.svg';
import bmp from '../../../public/assets/extensions/BMP.svg';
import crd from '../../../public/assets/extensions/CRD.svg';
import csv from '../../../public/assets/extensions/CSV.svg';
import DEFAULT from '../../../public/assets/extensions/DEFAULT.svg';
import dll from '../../../public/assets/extensions/DLL.svg';
import doc from '../../../public/assets/extensions/DOC.svg';
import docx from '../../../public/assets/extensions/DOCX.svg';
import dwg from '../../../public/assets/extensions/DWG.svg';
import exe from '../../../public/assets/extensions/EXE.svg';
import flv from '../../../public/assets/extensions/FLV.svg';
import giff from '../../../public/assets/extensions/GIFF.svg';
import html from '../../../public/assets/extensions/HTML.svg';
import iso from '../../../public/assets/extensions/ISO.svg';
import java from '../../../public/assets/extensions/JAVA.svg';
import jpg from '../../../public/assets/extensions/JPG.svg';
import mdb from '../../../public/assets/extensions/MDB.svg';
import mid from '../../../public/assets/extensions/MID.svg';
import mov from '../../../public/assets/extensions/MOV.svg';
import mp3 from '../../../public/assets/extensions/MP3.svg';
import mp4 from '../../../public/assets/extensions/MP4.svg';
import mpeg from '../../../public/assets/extensions/MPEG.svg';
import pdf from '../../../public/assets/extensions/PDF.svg';
import png from '../../../public/assets/extensions/PNG.svg';
import ppt from '../../../public/assets/extensions/PPT.svg';
import ps from '../../../public/assets/extensions/PS.svg';
import psd from '../../../public/assets/extensions/PSD.svg';
import pub from '../../../public/assets/extensions/PUB.svg';
import rar from '../../../public/assets/extensions/RAR.svg';
import raw from '../../../public/assets/extensions/RAW.svg';
import rss from '../../../public/assets/extensions/RSS.svg';
import svg from '../../../public/assets/extensions/SVG.svg';
import tiff from '../../../public/assets/extensions/TIFF.svg';
import txt from '../../../public/assets/extensions/TXT.svg';
import wav from '../../../public/assets/extensions/WAV.svg';
import wma from '../../../public/assets/extensions/WMA.svg';
import xml from '../../../public/assets/extensions/XML.svg';
import xsl from '../../../public/assets/extensions/XSL.svg';
import zip from '../../../public/assets/extensions/ZIP.svg';

// Mapping the imports to the extensions
export const iconPaths: Record<string, string> = {
    ai,
    avi,
    bmp,
    crd,
    csv,
    DEFAULT,
    dll,
    doc,
    docx,
    dwg,
    exe,
    flv,
    giff,
    html,
    iso,
    java,
    jpg,
    mdb,
    mid,
    mov,
    mp3,
    mp4,
    mpeg,
    pdf,
    png,
    ppt,
    ps,
    psd,
    pub,
    rar,
    raw,
    rss,
    svg,
    tiff,
    txt,
    wav,
    wma,
    xml,
    xsl,
    zip,
};

export type FileExtension = keyof typeof iconPaths | "unknown";

interface FileIconProps {
    extension?: FileExtension;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
};


const FileIcon: React.FC<FileIconProps> = ({ extension = "DEFAULT", className, size = "md" }) => {
    const iconSrc = iconPaths[extension] || iconPaths["DEFAULT"]; // Fallback to the unknown icon if not found

    return (
        <div className={cn("relative inline-flex", sizeClasses[size], className)}>
            <Image src={iconSrc} alt={extension} />
        </div>
    );
};

FileIcon.displayName = "FileIcon";

export default FileIcon;
