'use client';

import React from 'react';

export type InvoiceData = {
  user_name?: string;
  room_number?: string;
  room_price?: number | string;
  moto_fee?: number | string;
  water_price?: number | string;
  electricity_price?: number | string;
  other_fee?: number | string;
  status?: string;
  rent_date?: string;
  total?: number | string;
};

/**
 * A printable invoice component styled with Tailwind.
 * Use inside a dialog. It attempts to follow the structure of the provided image:
 * company header, invoice title, table of items, totals, signature lines.
 */
export function InvoicePreview({ data }: { data: InvoiceData }) {
  const {
    user_name = '',
    room_number = '',
    room_price = 0,
    moto_fee = 0,
    water_price = 0,
    electricity_price = 0,
    other_fee = 0,
    rent_date = '',
    // total intentionally ignored below
  } = data;

  // Coerce any incoming values to numbers (safe for strings / undefined)
  const roomPriceNum = Number(room_price) || 0;
  const motoFeeNum = Number(moto_fee) || 0;
  const waterPriceNum = Number(water_price) || 0;
  const electricityPriceNum = Number(electricity_price) || 0;
  const otherFeeNum = Number(other_fee) || 0;

  // Always compute total from the displayed line items to avoid mismatches
  const computedTotal =
    roomPriceNum + motoFeeNum + waterPriceNum + electricityPriceNum + otherFeeNum;

  return (
    <div className="p-4 text-sm text-gray-800 w-full max-w-2xl bg-white" id="invoice-print-area">
      {/* Company header similar to the image */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold">Buildware Team!</h2>
          <p className="text-xs">Phnom Phenh, SenSok</p>
          <p className="text-xs">Telegram: @Ear_Sokchan</p>
          <p className="text-xs">Email: sokchanear0@gmail.com</p>
        </div>
        <div className="text-right">
          <h3 className="text-2xl font-bold">លិខិត청求</h3>
          <p className="text-xs">លេខលិខិត: ________</p>
          <p className="text-xs">កាលបរិច្ឆេទ: {rent_date || '________'}</p>
        </div>
      </div>

      {/* Customer details */}
      <div className="mb-4">
        <div className="flex justify-between">
          <div>
            <p className="text-xs"><strong>អតិថិជន:</strong> {user_name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs"><strong>បន្ទប់:</strong> {room_number}</p>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="mb-4">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border px-2 py-1 w-12 text-left">ល.រ</th>
              <th className="border px-2 py-1 text-left">ការពិពណ៌នា</th>
              <th className="border px-2 py-1 w-20 text-right">បរិមាណ</th>
              <th className="border px-2 py-1 w-28 text-right">តម្លៃឯកតា</th>
              <th className="border px-2 py-1 w-28 text-right">ចំនួនប្រាក់</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">1</td>
              <td className="border px-2 py-1">ឈ្នួលបន្ទប់</td>
              <td className="border px-2 py-1 text-right">1</td>
              <td className="border px-2 py-1 text-right">${roomPriceNum.toFixed(2)}</td>
              <td className="border px-2 py-1 text-right">${roomPriceNum.toFixed(2)}</td>
            </tr>

            {motoFeeNum > 0 ? (
              <tr>
                <td className="border px-2 py-1">2</td>
                <td className="border px-2 py-1">ការឈ្នួលទីតាំងម៉ូតូ</td>
                <td className="border px-2 py-1 text-right">1</td>
                <td className="border px-2 py-1 text-right">${motoFeeNum.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">${motoFeeNum.toFixed(2)}</td>
              </tr>
            ) : null}

            {waterPriceNum > 0 ? (
              <tr>
                <td className="border px-2 py-1">3</td>
                <td className="border px-2 py-1">ឈ្នួលទឹក</td>
                <td className="border px-2 py-1 text-right">1</td>
                <td className="border px-2 py-1 text-right">${waterPriceNum.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">${waterPriceNum.toFixed(2)}</td>
              </tr>
            ) : null}

            {electricityPriceNum > 0 ? (
              <tr>
                <td className="border px-2 py-1">4</td>
                <td className="border px-2 py-1">ឈ្នួលលျច្ឆុប្បន្ន</td>
                <td className="border px-2 py-1 text-right">1</td>
                <td className="border px-2 py-1 text-right">${electricityPriceNum.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">${electricityPriceNum.toFixed(2)}</td>
              </tr>
            ) : null}

            {otherFeeNum > 0 ? (
              <tr>
                <td className="border px-2 py-1">5</td>
                <td className="border px-2 py-1">ផ្សេងទៀត</td>
                <td className="border px-2 py-1 text-right">1</td>
                <td className="border px-2 py-1 text-right">${otherFeeNum.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">${otherFeeNum.toFixed(2)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Totals and signatures */}
      <div className="flex justify-between items-start mt-4">
        <div className="w-2/3">
          <div className="mt-8 flex justify-between">
            <div className="text-center">
              <div className="h-12 border-b w-40 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-12 border-b w-40 mx-auto"></div>
            </div>
          </div>
        </div>

        <div className="w-1/3">
          <div className="border p-2">
            <div className="flex justify-between text-xs mb-1">
              <span>ចំនួនប្រាក់</span>
              <span className="font-semibold">${computedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>សរុប</span>
              <span className="font-bold">${computedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

