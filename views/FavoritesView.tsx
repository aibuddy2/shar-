
import React from 'react';
import { Heart } from 'lucide-react';

const FavoritesView: React.FC = () => {
  return (
    <div className="px-6 py-12 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
        <Heart size={40} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-800">သိမ်းဆည်းထားမှု မရှိသေးပါ</h3>
        <p className="text-sm text-slate-400 px-8">
          သင်နှစ်သက်သော အေးဂျင့်များ သို့မဟုတ် ဆောင်းပါးများကို နောက်မှ ပြန်ကြည့်ရန် နှလုံးသားပုံလေးကို နှိပ်ပြီး သိမ်းဆည်းနိုင်ပါသည်။
        </p>
      </div>
    </div>
  );
};

export default FavoritesView;
