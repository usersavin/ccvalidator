
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface ValidationStatsProps {
  isValid: boolean;
  luhnValid: boolean;
  numberLength: number;
}

const ValidationStats: React.FC<ValidationStatsProps> = ({ isValid, luhnValid, numberLength }) => {
  const pieData = [
    { name: 'Validated', value: isValid ? 100 : 0 },
    { name: 'Pending', value: isValid ? 0 : 100 },
  ];

  const barData = [
    { name: 'Luhn', score: luhnValid ? 100 : 0 },
    { name: 'Length', score: numberLength >= 13 ? 100 : (numberLength / 16) * 100 },
  ];

  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-4">Overall Validity</h3>
        <div className="w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={30}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className={`text-sm font-bold ${isValid ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isValid ? 'VERIFIED' : 'INVALID/PENDING'}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-4">Metric Score</h3>
        <div className="w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: -20, right: 20 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={50} style={{ fontSize: '10px' }} />
              <Tooltip />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score === 100 ? '#10b981' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ValidationStats;
