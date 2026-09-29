"use client";

import { useState } from "react";
import LocationHeader from "../../components/dashboard/Location/LocationHeader";
import StatCardUser, { StatItem } from "../../components/dashboard/StatCardUser";
import DynamicFilterBar, { FilterField } from "../../components/tables/BasicTables/DynamicFilterBar";
import PaysTable, { Pays as PaysType } from "../../components/dashboard/Location/Pays/PaysTable";
import AddPay from "../../components/dashboard/Location/Pays/AddPay";
import {
    GroupIcon,
    CheckCircleIcon,
    AlertHexaIcon,
    AlertIcon,
} from "../../icons";

function getUserStatItems(total: number, perPage: number): StatItem[] {
    return [
        {
            title: "Total utilisateurs",
            value: total,
            icon: <GroupIcon className="w-5 h-5 fill-current" />,
            percentage: "12.5% ce mois",
            isPositive: true,
            iconBgClass: "bg-blue-600",
        },
        {
            title: "Avec comptes Pro",
            value: perPage,
            icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
            percentage: "8.3% ce mois",
            isPositive: true,
            iconBgClass: "bg-emerald-500",
        },
        {
            title: "Abonnements expirés",
            value: 99,
            icon: <AlertHexaIcon className="w-5 h-5 fill-current" />,
            percentage: "4.6% ce mois",
            isPositive: false,
            iconBgClass: "bg-amber-500",
        },
        {
            title: "Signalés",
            value: 69,
            icon: <AlertIcon className="w-5 h-5 fill-current" />,
            percentage: "2.1% ce mois",
            isPositive: false,
            iconBgClass: "bg-red-500",
        },
    ];
}

const usersFilterFields: FilterField[] = [
    {
        id: "search",
        label: "Recherche",
        type: "text",
        placeholder: "Nom, email, téléphone ou ID...",
    },
    {
        id: "ville",
        label: "Ville",
        type: "select",
        options: [
            { label: "Toutes les villes", value: "" },
            { label: "Casablanca", value: "casablanca" },
            { label: "Rabat", value: "rabat" },
            { label: "Marrakech", value: "marrakech" },
        ],
    },
    {
        id: "emailVerifie",
        label: "Email vérifié",
        type: "select",
        options: [
            { label: "Tous", value: "" },
            { label: "Vérifié", value: "true" },
            { label: "Non vérifié", value: "false" },
        ],
    },
    {
        id: "telephoneVerifie",
        label: "Téléphone vérifié",
        type: "select",
        options: [
            { label: "Tous", value: "" },
            { label: "Vérifié", value: "true" },
            { label: "Non vérifié", value: "false" },
        ],
    },
];

const dummyPays: PaysType[] = [
    {
        pays_id: 1,
        name: "Maroc",
        latitude: 31.7917,
        longitude: -7.0926,
        compteur_search: 1250,
        compteur_publications: 450,
        status: true,
    },
    {
        pays_id: 2,
        name: "France",
        latitude: 46.2276,
        longitude: 2.2137,
        compteur_search: 890,
        compteur_publications: 320,
        status: true,
    },
    {
        pays_id: 3,
        name: "Espagne",
        latitude: 40.4637,
        longitude: -3.7492,
        compteur_search: 640,
        compteur_publications: 210,
        status: false,
    }
];

export default function Pays() {
    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

    const handleAddPays = () => {
        setIsOffcanvasOpen(true);
    };

    const [filterValues, setFilterValues] = useState<Record<string, any>>({
        search: "",
        ville: "",
        emailVerifie: "",
        telephoneVerifie: "",
    });

    const handleFilterChange = (id: string, value: any) => {
        setFilterValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleFilter = () => {
        console.log("Applying users filter:", filterValues);
    };

    return (
        <div className="w-full min-h-screen p-2 bg-slate-50 dark:bg-slate-950 transition-colors">
            <LocationHeader
                title="Pays"
                buttonText="Ajouter un pays"
                onAdd={handleAddPays}
            />

            <StatCardUser items={getUserStatItems(158, 596)} />
            <DynamicFilterBar
                fields={usersFilterFields}
                values={filterValues}
                onChange={handleFilterChange}
                onFilter={handleFilter}
            />

            <div className="mt-4">
                <PaysTable paysList={dummyPays} />
            </div>

            <AddPay 
                isOpen={isOffcanvasOpen} 
                onClose={() => setIsOffcanvasOpen(false)} 
            />

        </div>
    );
}