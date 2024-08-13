'use client'
import React, {ReactNode} from 'react';
import {Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuToggle} from "@nextui-org/react";
import Logo from "@/components/common/Logo";
import {cn} from "@/lib/utils";

function NavBar({children, className}: {children: ReactNode, className?: string}) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    return (
        <div className='h-screen'>
            <div
                className="h-full w-full relative antialiased overflow-hidden ">
                <Navbar
                    className={cn('z-0 bg-white border-b-2 border-gray-200', className)}
                    classNames={{
                        wrapper: "max-w-full h-[3rem]",
                    }}
                    isBordered
                    isMenuOpen={isMenuOpen}
                    onMenuOpenChange={setIsMenuOpen}
                    isBlurred={false}
                >

                    <NavbarContent className="pr-3" justify="center">
                        <NavbarBrand>
                            <Logo/>
                        </NavbarBrand>
                    </NavbarContent>
                    <NavbarContent justify="end" className="gap-8">
                        {children}
                    </NavbarContent>
                </Navbar>
            </div>
        </div>
    );
}

export default NavBar;