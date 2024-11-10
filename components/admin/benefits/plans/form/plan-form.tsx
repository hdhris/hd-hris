'use client'
import React, {useState} from 'react';
import {DrawerFormTypes} from "@/types/drawer-form/drawer-form-types";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import FormDrawer from "@/components/common/forms/FormDrawer";
import Typography from '@/components/common/typography/Typography';
import {Input, Select, SelectItem} from "@nextui-org/react";
import {Label} from "@/components/ui/label";
import InputStyle from "@/lib/custom/styles/InputStyle";
import {Form, FormLabel} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";


interface BenefitPlanFormProps extends DrawerFormTypes {
    plan?: BenefitPlan
}

type ContributionTier = {
    contribution_limit_type: "fixed" | "below" | "above"
    contribution_type: "fixed" | "percentage"
    contribution_amount: number
    employer_rate: number
    employee_rate: number
}

function PlanForm({plan, ...rest}: BenefitPlanFormProps) {
    const form = useForm<any>({
        resolver: zodResolver(z.object({})), defaultValues: {}
    })
    const [tiers, setTiers] = useState<ContributionTier[]>([
        {
            contribution_limit_type: "fixed",
            contribution_type: "fixed",
            contribution_amount: 0,
            employer_rate: 0,
            employee_rate: 0
        }
    ])

    const addTier = () => {
        setTiers([...tiers, {
            contribution_limit_type: "fixed",
            contribution_type: "fixed",
            contribution_amount: 0,
            employer_rate: 0,
            employee_rate: 0
        }])
    }

    const removeTier = (index: number) => {
        setTiers(tiers.filter((_, i) => i !== index))
    }

    const updateTier = (index: number, updatedTier: ContributionTier) => {
        const newTiers = [...tiers];
        newTiers[index] = updatedTier;
        setTiers(newTiers);
    }

    const contribution_limit_type_selection: Option<ContributionTier["contribution_limit_type"]>[] = [
        {
            label: "Fixed", value: "fixed",
        },{
            label: "Below", value: "below",
        },{
            label: "Above", value: "above",
        },
    ]

    return (
        <FormDrawer title="Add Benefit Plan" description="Add a new benefit plan" onOpen={rest.onOpen} isOpen={rest.isOpen} size="md">
            <Form {...form}>
                <form>
                    {
                        tiers.map((tier, index) => (
                            <div key={index} className="flex gap-2 border-b p-2">
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Contribution Limit Type</FormLabel>
                                    <div className="flex gap-2">
                                        <Selection options={contribution_limit_type_selection} onChange={(value) =>  updateTier(index, {...tier, contribution_limit_type: value})}/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Amount</Label>
                                    <div className="flex gap-2">
                                        {/*<Selection options={contribution_limit_type_selection} onChange={(value) =>  updateTier(index, {...tier, contribution_limit_type: value})}/>*/}
                                        <Input
                                            type="number"
                                            onValueChange={(value) => {
                                                updateTier(index, {...tier, contribution_amount: Number(value)})
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Contribution Type</FormLabel>
                                    <div className="flex gap-2">
                                        <input type="radio" name={`tier-${index}-contribution-type`} value="fixed"
                                               checked={tier.contribution_type === "fixed"}
                                               onChange={() => updateTier(index, {...tier, contribution_type: "fixed"})}/>
                                        <label>Fixed</label>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="radio" name={`tier-${index}-contribution-type`} value="percentage"
                                               checked={tier.contribution_type === "percentage"}
                                               onChange={() => updateTier(index, {...tier, contribution_type: "percentage"})}/>
                                        <label>Percentage</label>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Contribution Amount</FormLabel>
                                    <input type="number" value={tier.contribution_amount} onChange={(e) => updateTier(index, {...tier, contribution_amount: Number(e.target.value)})}/>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Employer Rate</FormLabel>
                                    <input type="number" value={tier.employer_rate} onChange={(e) => updateTier(index, {...tier, employer_rate: Number(e.target.value)})}/>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Employee Rate</FormLabel>
                                    <input type="number" value={tier.employee_rate} onChange={(e) => updateTier(index, {...tier, employee_rate: Number(e.target.value)})}/>
                                </div>
                                <button onClick={() => removeTier(index)}>Remove</button>
                            </div>
                        ))
                    }
                    <button onClick={addTier}>Add Tier</button>
                </form>
            </Form>

        </FormDrawer>
    );
}

export default PlanForm;

type Option<T> = {
    value: T;
    label: string;
};

type CustomSelectProps<T> = {
    options: Option<T>[];
    onChange?: (value: T) => void;
};

const Selection = <T,>({ options, onChange }: CustomSelectProps<T>) => {
    return (
        <Select
            variant="bordered"
            color="primary"
            size="sm"
            radius="sm"
            labelPlacement="outside"
            onChange={(e) => onChange && onChange(e.target.value as T)}
        >
            {options.map((option) => (
                <SelectItem key={String(option.value)} value={option.value as any}>
                    {option.label}
                </SelectItem>
            ))}
        </Select>
    );
};
