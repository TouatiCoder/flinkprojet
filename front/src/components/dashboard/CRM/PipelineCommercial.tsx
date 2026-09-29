import React, { useState, useRef } from "react";
import { Phone, MessageCircle, Mail, MoreHorizontal, Info } from "lucide-react";

export type ProspectStatus = "Chaud" | "Tiède" | "Froid" | "Actif" | "Perdu";

export interface Prospect {
  id: string;
  company: string;
  contactName: string;
  category: string;
  city: string;
  amount: number;
  source: string;
  status: ProspectStatus;
  note?: string;
  columnId: string;
}

export interface PipelineColumn {
  id: string;
  label: string;
  number: number;
  color: string;
  count: number;
  totalAmount: number;
  prospects: Prospect[];
}

export interface PipelineData {
  columns: PipelineColumn[];
}

interface PipelineCommercialProps {
  data: PipelineData;
  onDataChange?: (data: PipelineData) => void;
  onProspectClick?: (prospect: Prospect) => void;
}

const STATUS_STYLES: Record<ProspectStatus, string> = {
  Chaud: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  Tiède: "bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  Froid: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Actif: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
  Perdu: "bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const STATUS_DOT: Record<ProspectStatus, string> = {
  Chaud: "bg-red-500",
  Tiède: "bg-orange-400",
  Froid: "bg-blue-400",
  Actif: "bg-green-500",
  Perdu: "bg-gray-400",
};

function StatusBadge({ status }: { status: ProspectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

interface ProspectCardProps {
  prospect: Prospect;
  onDragStart: (e: React.DragEvent, prospectId: string, fromColumnId: string) => void;
  onClick?: () => void;
}

function ProspectCard({ prospect, onDragStart, onClick }: ProspectCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prospect.id, prospect.columnId)}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none group"
    >
      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 leading-tight truncate">
        {prospect.company}
      </p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{prospect.contactName}</p>

      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{prospect.category}</span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{prospect.city}</span>
      </div>

      <p className="text-[12px] font-bold text-gray-700 dark:text-gray-300 mt-1.5">
        {prospect.amount.toLocaleString("fr-MA")} DH
      </p>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{prospect.source}</p>

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <StatusBadge status={prospect.status} />
        {prospect.note && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 italic truncate">{prospect.note}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700  group-hover:opacity-100 transition-opacity">
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Phone className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
          <Mail className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-auto">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  column: PipelineColumn;
  onDragStart: (e: React.DragEvent, prospectId: string, fromColumnId: string) => void;
  onDrop: (e: React.DragEvent, toColumnId: string) => void;
  onProspectClick?: (prospect: Prospect) => void;
}

function PipelineColumnCard({ column, onDragStart, onDrop, onProspectClick }: PipelineColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, column.id);
  };

  return (
    <div
      className="flex-none w-48 flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-2">
        <div className={`h-1 w-full rounded-full mb-2 ${column.color}`} />

        <div className="flex items-center justify-between gap-1">
          <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-tight">
            <span className="text-gray-400 dark:text-gray-500 mr-1">{column.number}.</span>
            {column.label}
          </p>
          <span className="flex-none text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded px-1.5 py-0.5 font-medium">
            {column.count}
          </span>
        </div>

        <p className="text-[12px] font-bold text-gray-800 dark:text-gray-200 mt-1">
          {column.totalAmount.toLocaleString("fr-MA")} DH
        </p>
      </div>

      <div
        className={`flex-1 min-h-20 rounded-lg transition-colors duration-150 p-1 ${
          isDragOver ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800/50 ring-dashed" : "bg-transparent"
        }`}
      >
        {column.prospects.map((prospect) => (
          <ProspectCard 
            key={prospect.id} 
            prospect={prospect} 
            onDragStart={onDragStart} 
            onClick={() => onProspectClick?.(prospect)}
          />
        ))}
        {column.prospects.length === 0 && (
          <div className="h-16 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-300 dark:text-gray-600">Déposer ici</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelineCommercial({ data, onDataChange, onProspectClick }: PipelineCommercialProps) {
  const [pipelineData, setPipelineData] = useState<PipelineData>(data);
  const dragRef = useRef<{ prospectId: string; fromColumnId: string } | null>(null);

  const handleDragStart = (
    _e: React.DragEvent,
    prospectId: string,
    fromColumnId: string
  ) => {
    dragRef.current = { prospectId, fromColumnId };
  };

  const handleDrop = (_e: React.DragEvent, toColumnId: string) => {
    if (!dragRef.current) return;
    const { prospectId, fromColumnId } = dragRef.current;
    if (fromColumnId === toColumnId) return;

    const updatedColumns = pipelineData.columns.map((col) => {
      if (col.id === fromColumnId) {
        const movedProspect = col.prospects.find((p) => p.id === prospectId);
        return {
          ...col,
          prospects: col.prospects.filter((p) => p.id !== prospectId),
          count: col.count - 1,
          totalAmount: col.totalAmount - (movedProspect?.amount ?? 0),
        };
      }
      if (col.id === toColumnId) {
        const sourceCol = pipelineData.columns.find((c) => c.id === fromColumnId);
        const movedProspect = sourceCol?.prospects.find((p) => p.id === prospectId);
        if (!movedProspect) return col;
        const updated = { ...movedProspect, columnId: toColumnId };
        return {
          ...col,
          prospects: [...col.prospects, updated],
          count: col.count + 1,
          totalAmount: col.totalAmount + movedProspect.amount,
        };
      }
      return col;
    });

    const newData = { columns: updatedColumns };
    setPipelineData(newData);
    onDataChange?.(newData);
    dragRef.current = null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Pipeline commercial</span>
          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="flex items-center gap-2">
          <select className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 cursor-pointer">
            <option>Tous les commerciaux</option>
            <option>Youssef</option>
            <option>Mohammed</option>
          </select>
          <select className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 cursor-pointer">
            <option>Étapes actives</option>
            <option>Toutes les étapes</option>
          </select>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="flex gap-3 p-4 overflow-x-auto"
        style={{ minHeight: "520px" }}
      >
        {pipelineData.columns.map((col) => (
          <PipelineColumnCard
            key={col.id}
            column={col}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onProspectClick={onProspectClick}
          />
        ))}
      </div>
    </div>
  );
}
