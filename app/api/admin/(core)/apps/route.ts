import {NextResponse} from "next/server";
import {Integrations} from "@/types/routes/default/types";


export function GET() {
    const items:Integrations[] = [{
        key: "tidb",
        avatarSrc: "https://static.pingcap.com/files/2023/07/09063705/TiDB-logo.png",
        title: 'TiDB',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
        type: "database",
    }, {
        key: "zkteco",
        avatarSrc: "https://logovectorseek.com/wp-content/uploads/2020/04/zkteco-logo-vector.png",
        title: 'ZKTeco',
        subtitle: 'globally renowned provider of biometric verification algorithm techniques, sensors and software platforms.',
        type: "attendance_monitoring",
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
        type: "cloud_storage",
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
        type: "cloud_storage",
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
        type: "cloud_storage",
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
        type: "cloud_storage",
    },];
    return NextResponse.json(items);
}