"use client";

import { useState } from "react";
import LocationHeader from "../../components/dashboard/Location/LocationHeader";
import StatCardUser, { StatItem } from "../../components/dashboard/StatCardUser";
import VilleTable, { Ville as VilleType } from "../../components/dashboard/Location/Villes/VilleTable";
import AddVille from "../../components/dashboard/Location/Villes/AddVille";
import DynamicFilterBar, { FilterField } from "../../components/tables/BasicTables/DynamicFilterBar";

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

const dummyVilles: VilleType[] = [
    {
        ville_id: 1,
        name: "Casablanca",
        pays: 'Maroc',
        latitude: 33.5731,
        longitude: -7.5898,
        compteur_search: 4250,
        compteur_publications: 1450,
        status: true,
    },
    {
        ville_id: 2,
        name: "Rabat",
        pays: 'Maroc',
        latitude: 34.0209,
        longitude: -6.8416,
        compteur_search: 2890,
        compteur_publications: 820,
        status: true,
    },
    {
        ville_id: 3,
        name: "Paris",
        pays: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        compteur_search: 6640,
        compteur_publications: 2210,
        status: false,
    }
];

const villesFilterFields: FilterField[] = [
    {
        id: "search",
        label: "Recherche",
        type: "text",
        placeholder: "Nom, email, téléphone ou ID...",
    },
    {
        id: "pays",
        label: "Pays",
        type: "select",
        options: [
            { label: "Tous les pays", value: "" },
            { label: "Maroc", value: "maroc" },
            { label: "France", value: "france" },
            { label: "Espagne", value: "espagne" },
        ],
    },
    {
        id: "status",
        label: "Statut",
        type: "select",
        options: [
            { label: "Tous", value: "" },
            { label: "Actif", value: "true" },
            { label: "Inactif", value: "false" },
        ],
    },
];

export default function Villes () {
    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    
    const handleAddVille = () => {
        setIsOffcanvasOpen(true);
    };

    const [filterValues, setFilterValues] = useState<Record<string, any>>({
        search: "",
        pays: "",
        status: "",
    });

    const handleFilterChange = (id: string, value: any) => {
        setFilterValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleFilter = () => {
        console.log("Applying villes filter:", filterValues);
    };

    return (
        <div className="w-full min-h-screen p-2 bg-slate-50 dark:bg-slate-950 transition-colors">
            <LocationHeader
                title="Villes"
                buttonText="Ajouter une ville"
                onAdd={handleAddVille}
            />

            <StatCardUser items={getUserStatItems(158, 596)} />

            <DynamicFilterBar
                fields={villesFilterFields}
                values={filterValues}
                onChange={handleFilterChange}
                onFilter={handleFilter}
            />

            <div className="mt-4">
                <VilleTable villeList={dummyVilles} />
            </div>

            <AddVille 
                isOpen={isOffcanvasOpen} 
                onClose={() => setIsOffcanvasOpen(false)} 
            />
        </div>
    )
}