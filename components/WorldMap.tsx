"use client";

import {
  ComposableMap,
  Geographies,
  Geography as MapGeography,
  Marker
} from "react-simple-maps";
import type {Locale} from "@/i18n/routing";
import type {Geography} from "@/lib/types";

const geoUrl = "/maps/world-110m.json";

const markers = [
  {coordinates: [105, 35] as [number, number], label: "Asia"},
  {coordinates: [45, 25] as [number, number], label: "Middle East"},
  {coordinates: [20, 5] as [number, number], label: "Africa"},
  {coordinates: [-60, -15] as [number, number], label: "Latin America"},
  {coordinates: [55, 55] as [number, number], label: "CIS"}
];

export function WorldMap({
  locale,
  geography
}: {
  locale: Locale;
  geography: Geography;
}) {
  return (
    <section className="bg-dark px-5 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "ru" ? "ГЕОГРАФИЯ" : locale === "zh" ? "区域" : "Geography"}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-text md:text-5xl">
            {locale === "ru"
              ? "География работы"
              : locale === "zh"
                ? "供应区域"
                : "Supply geography"}
          </h2>
          <div className="mt-8 grid gap-3">
            {geography.countries.map((item) => (
              <div
                key={item.id}
                className="rounded border border-white/10 bg-dark-2 p-4"
              >
                <p className="font-semibold text-text">{item.name[locale]}</p>
                <p className="mt-1 text-sm text-muted">{item.region[locale]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-dark-2 p-3">
          <ComposableMap projectionConfig={{scale: 145}} className="h-auto w-full">
            <Geographies geography={geoUrl}>
              {({geographies}) =>
                geographies.map((geo) => (
                  <MapGeography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#2A2F35"
                    stroke="#0E1216"
                    strokeWidth={0.6}
                    style={{
                      default: {outline: "none"},
                      hover: {fill: "#33404a", outline: "none"},
                      pressed: {outline: "none"}
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map((marker) => (
              <Marker key={marker.label} coordinates={marker.coordinates}>
                <circle r={5} fill="#00A3A3" opacity={0.95} />
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
    </section>
  );
}
