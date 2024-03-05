import React, { useState, useContext } from 'react';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

import './PlaceItem.css';

const PlaceItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id);
    } catch (err) { }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {/* tried to put <Link to={`/places/${props.id}`}></Link> here but doesn't work */}
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">

          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h4>{props.title}</h4>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              address
            </Button>
            {((auth.userId === props.creatorId) || (auth.userRole === "admin")) && (
              <Button to={`/places/${props.id}`}>edit</Button>
            )}
            {((auth.userId === props.creatorId) || (auth.userRole === "admin")) && (
              <Button danger onClick={showDeleteWarningHandler}>
                delete
              </Button>
            )}
            <Button to={`/${props.id}/products`}>show all products</Button>
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
