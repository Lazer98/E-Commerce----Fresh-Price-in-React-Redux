import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom'

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './ProductItem.css';

const ProductItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  let params = useParams();
  console.log(props);
  

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
        `http://localhost:5000/api/products/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        header={props.address}
        contentClass="product-item__modal-content"
        footerClass="product-item__modal-actions"
      >
       
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="product-item__modal-actions"
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
          Do you want to proceed and delete this product? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      <li className="product-item">
        <Card className="product-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="product-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.name}
            />
          </div>
          <div className="product-item__info">
            <h3>{props.name}</h3>
            <h5 className="lineThrough">Old price: {props.price}</h5>
            <h5>Discount: {props.discount}%</h5>
            <h3>New Price is: {props.newPrice}</h3>
            <p> {props.description}</p>
          </div>
          <div className="product-item__actions">
            {((props.creatorUser === auth.userId) || (auth.userRole=== "admin")) && (
              <Button to={`/${auth.userId}/products/${props.id}`}>edit</Button>
            )}

            {((props.creatorUser === auth.userId)|| (auth.userRole=== "admin")) && (
              <Button danger onClick={showDeleteWarningHandler}>
                delete
              </Button>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default ProductItem;
