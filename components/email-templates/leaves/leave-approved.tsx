import {Column, Hr, Link, render, Row, Section, Text} from "@react-email/components";
import FlexibleEmailTemplate from "@/app/email/notification-email";


interface EmailProps {
    name: string,
    leave_type: string,
    start_date: string
    end_date: string
    status: string,
    allocated_days: number,
    remaining_days: string
}

export const approved_leave_email = async ({...rest}: EmailProps) => {
    return await render(<FlexibleEmailTemplate>
        <Text className="text-gray-800 mb-4">
            Dear {rest.name},
        </Text>
        <Text className="text-gray-800 mb-4">
            <Section className="my-[16px]">
                <Section>
                    <Row>
                        <Text className="m-0 text-[24px] font-semibold leading-[32px] text-gray-900">
                           Your Leave Request Summary
                        </Text>
                        <Text className="mt-[8px] text-[16px] leading-[24px] text-gray-500">
                            Review the details of your leave request, including dates, duration, and status, to ensure accuracy and approval readiness.
                        </Text>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
                <Section>
                    <Row>
                        <Column className="w-[90%]">
                            <Text className="m-0 text-[20px] font-semibold leading-[28px] text-gray-900">
                                Leave Type
                            </Text>
                            <Text className="m-0 mt-[8px] text-[16px] leading-[24px] text-gray-500">
                                {rest.leave_type}
                            </Text>
                        </Column>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
                <Section>
                    <Row>
                        <Column className="w-[90%]">
                            <Text className="m-0 text-[20px] font-semibold leading-[28px] text-gray-900">
                                Start Date
                            </Text>
                            <Text className="m-0 mt-[8px] text-[16px] leading-[24px] text-gray-500">
                                {rest.start_date}
                            </Text>
                        </Column>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
                <Section>
                    <Row>
                        <Column className="w-[90%]">
                            <Text className="m-0 text-[20px] font-semibold leading-[28px] text-gray-900">
                                End Date
                            </Text>
                            <Text className="m-0 mt-[8px] text-[16px] leading-[24px] text-gray-500">
                                {rest.end_date}
                            </Text>
                        </Column>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
                <Section>
                    <Row>
                        <Column className="w-[90%]">
                            <Text className="m-0 text-[20px] font-semibold leading-[28px] text-gray-900">
                               Status
                            </Text>
                            <Text className="m-0 mt-[8px] text-[16px] leading-[24px] text-gray-500">
                                {rest.status}
                            </Text>
                        </Column>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
                <Section>
                    <Row>
                        <Column className="w-[90%]">
                            <Text className="m-0 text-[20px] font-semibold leading-[28px] text-gray-900">
                               Allocated Days
                            </Text>
                            <Text className="m-0 mt-[8px] text-[16px] leading-[24px] text-gray-500">
                                {rest.allocated_days}
                            </Text>
                        </Column>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
                <Section>
                    <Row>
                        <Column className="w-[90%]">
                            <Text className="m-0 text-[20px] font-semibold leading-[28px] text-gray-900">
                               Remaining Days
                            </Text>
                            <Text className="m-0 mt-[8px] text-[16px] leading-[24px] text-gray-500">
                                {rest.remaining_days}
                            </Text>
                        </Column>
                    </Row>
                </Section>
                <Hr className="mx-0 my-[24px] w-full border border-solid !border-gray-300"/>
            </Section>
        </Text>
    </FlexibleEmailTemplate>)
}