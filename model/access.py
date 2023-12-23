# import tflite_runtime.interpreter as tflite
import tensorflow as tf
import time
import pandas as pd
import numpy as np
import cv2
import mediapipe as mp
import json
 

class HandSignRecognizer:
    def __init__(self):

        self.mp_holistic = mp.solutions.holistic
        self.ROWS_PER_FRAME = 543
        self.face = pd.DataFrame()
        self.frame_skip = 8
        
        xyz = pd.read_csv("xyz_df.csv")
        self.xyz_skel = xyz[['type', 'landmark_index']].drop_duplicates().reset_index(drop=True).copy()
        # Dictionaries to translate sign <-> ordinal encoded sign
        self.prediction_fn = self.pred_fn()
        json_file_path = 'sign_to_prediction_index_map.json'
        # Open the JSON file and load its contents into a Python dictionary
        with open(json_file_path, 'r') as json_file:
            json_data = json.load(json_file)

        # Now, json_data contains the content of the JSON file as a Python dictionary
        self.n2sign = {value: key for key, value in json_data.items()}
        

    def create_frame_landmark_df(self, results, frame):
        
        pose = pd.DataFrame()
        left_hand = pd.DataFrame()
        right_hand = pd.DataFrame()
        
        if (frame/self.frame_skip)<2:
            
            if results.face_landmarks is not None:
                for i, point in enumerate(results.face_landmarks.landmark):
                    self.face.loc[i, 'x'] = point.x
                    self.face.loc[i, 'y'] = point.y
                    self.face.loc[i, 'z'] = point.z
            face = self.face
            face = face.reset_index().rename(columns={'index': 'landmark_index'}).assign(type='face') 
            self.face=face
           
        if results.pose_landmarks is not None:
            for i, point in enumerate(results.pose_landmarks.landmark):
                pose.loc[i, 'x'] = point.x
                pose.loc[i, 'y'] = point.y
                pose.loc[i, 'z'] = point.z
        if results.left_hand_landmarks is not None:
            for i, point in enumerate(results.left_hand_landmarks.landmark):
                left_hand.loc[i, 'x'] = point.x
                left_hand.loc[i, 'y'] = point.y
                left_hand.loc[i, 'z'] = point.z
        if results.right_hand_landmarks is not None:
            for i, point in enumerate(results.right_hand_landmarks.landmark):
                right_hand.loc[i, 'x'] = point.x
                right_hand.loc[i, 'y'] = point.y
                right_hand.loc[i, 'z'] = point.z

        
        pose = pose.reset_index().rename(columns={'index': 'landmark_index'}).assign(type='pose')
        left_hand = left_hand.reset_index().rename(columns={'index': 'landmark_index'}).assign(type='left_hand')
        right_hand = right_hand.reset_index().rename(columns={'index': 'landmark_index'}).assign(type='right_hand')
        landmarks = pd.concat([self.face, pose, left_hand, right_hand]).reset_index(drop=True)
        landmarks = self.xyz_skel.merge(landmarks, on=['type', 'landmark_index'], how='left')
        landmarks = landmarks.assign(frame=frame)
        return landmarks

    
    def predict(self, xyz___):
        prediction = self.prediction_fn(inputs=xyz___)
        pred = prediction['outputs'].argmax()
        sign = self.n2sign[pred]
        return sign, prediction['outputs'][pred]

    def pred_fn(self):
        interpreter = tf.lite.Interpreter('model_new.tflite')
        prediction_fn = interpreter.get_signature_runner("serving_default")
        return prediction_fn

    def capturing_video(self, video_path):
        all_landmarks = []
        cap = cv2.VideoCapture(video_path)
        


        with self.mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            frame = 0
            while cap.isOpened():
                frame += 1
                success, image = cap.read()
                if not success:
                    print("End of video.")
                    break

                if (frame % self.frame_skip) == 0:
                    
                    # image.flags.writeable = False
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    results = holistic.process(image)
                    #results = hands.process(image)

                    landmarks_df = self.create_frame_landmark_df(results, frame)
                    all_landmarks.append(landmarks_df)
                    
                    
                    

        cap.release()
        all_landmarks_df = pd.concat(all_landmarks).reset_index(drop=True)
        return all_landmarks_df

    def load_relevant_data_subset(self, landmarks):
        data_columns = ['x', 'y', 'z']
        data = landmarks[data_columns]
        n_frames = int(len(data) / self.ROWS_PER_FRAME)
        data = data.values.reshape(n_frames, self.ROWS_PER_FRAME, len(data_columns))
        return data.astype(np.float32)

    def vid_to_eng(self, video_path):
        
        landmarks = self.capturing_video(video_path)
        xyz_npp = self.load_relevant_data_subset(landmarks)
        sign, confidence = self.predict(xyz_npp)
        if confidence > 4:
            return sign , confidence
        return "", confidence
    

recognizer = HandSignRecognizer()
video_path = r"tes22.mp4"

start_time = time.time()
s,a = recognizer.vid_to_eng(video_path)
print(s)
print(a)
end_time = time.time()
time_take = end_time - start_time
print(time_take)



