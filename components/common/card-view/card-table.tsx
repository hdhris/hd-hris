import React, {ReactNode} from 'react';
interface CardTableData {
    value: any | ReactNode,
    label: ReactNode
}

function CardTable({data}: {data: CardTableData[] }) {
    return (
        <table className="w-full text-sm">
            <tbody>
            {data.map((item, idx) => (<tr key={idx} className="border-b last:border-b-0">
                <td className="py-2 px-4 text-gray-500">{item.label}</td>
                <td className="py-2 px-4">{item.value}</td>
            </tr>))}
            </tbody>
        </table>
    );
}

export default CardTable;