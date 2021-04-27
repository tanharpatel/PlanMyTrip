import React from 'react';
import { Link } from 'react-router-dom';

export default function Error() {
  return (
    <main className="main">
      <div className="error">
        <div className="error__title">
          <h2 className="heading-secondary heading-secondary--error">Uh oh! Something went wrong!</h2>
          <h2 className="error__emoji">🤯</h2>
        </div>
        <Link to="/" className="btn btn--blue" style={{ display: "flex", justifyContent: "center", margin: "0 40%" }}>Refresh App</Link>
      </div>
    </main>
  );
}