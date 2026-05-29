// Tweaks island for Gabinet site
function TweaksApp(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply on every change
  React.useEffect(() => { window.__applyTweaks && window.__applyTweaks(t); }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Paleta" />
      <TweakSelect
        label="Wariant"
        value={t.palette}
        options={[
          {value:'warm-classic',  label:'Warm Classic (beż / oliwka / granat)'},
          {value:'olive-forward', label:'Olive Forward — głębszy zielony'},
          {value:'soft-cream',    label:'Soft Cream — jaśniejsza, świeższa'},
          {value:'deep-navy',     label:'Deep Navy — głęboki granat'},
        ]}
        onChange={(v) => setTweak('palette', v)}
      />

      <TweakSection label="Wideo w tle" />
      <TweakSlider
        label="Tempo wideo"
        value={t.videoSpeed}
        min={0.25} max={1} step={0.05}
        onChange={(v) => setTweak('videoSpeed', v)}
      />
      <TweakSlider
        label="Krycie warstwy beż"
        value={t.tintIntensity}
        min={0.5} max={1} step={0.02}
        onChange={(v) => setTweak('tintIntensity', v)}
      />

      <TweakSection label="Animacja wejścia" />
      <TweakRadio
        label="Tempo"
        value={t.animation}
        options={['subtle', 'graceful', 'bold']}
        onChange={(v) => setTweak('animation', v)}
      />
    </TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById('tweaks-root'));
root.render(<TweaksApp />);
