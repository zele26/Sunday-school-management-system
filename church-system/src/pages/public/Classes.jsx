import React from 'react';

const classList = [
  { grade: 'Grade 7', age: '12-13', description: 'የመጀመሪያ ደረጃ የመጽሐፍ ቅዱስ ትምህርት' },
  { grade: 'Grade 8', age: '13-14', description: 'የክርስትና ሕይወት መሠረቶች' },
  { grade: 'Grade 9', age: '14-15', description: 'የወንጌል ታሪክ እና ትምህርት' },
  { grade: 'Grade 10', age: '15-16', description: 'የብሉይ ኪዳን አጠቃላይ እይታ' },
  { grade: 'Grade 11', age: '16-17', description: 'የሐዋርያት ሥራ እና የመጀመሪያዎቹ አብያተ ክርስቲያናት' },
  { grade: 'Grade 12', age: '17-18', description: 'የክርስትና መሪነት እና የሕይወት ዝግጅት' },
];

const Classes = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold text-slate-800 mb-6">ክፍሎቻችን</h1>
    <div className="grid md:grid-cols-2 gap-4">
      {classList.map(c => (
        <div key={c.grade} className="bg-white p-4 rounded-xl shadow border">
          <h3 className="font-bold text-slate-700">{c.grade} ({c.age})</h3>
          <p className="text-sm text-slate-500 mt-1">{c.description}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Classes;