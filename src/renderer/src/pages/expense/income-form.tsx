import { Form, Input, Button, Select, DatePicker, InputNumber, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { useState } from 'react'
import { useNavigate } from 'react-router'

const { TextArea } = Input

function IncomeForm() {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const navigate = useNavigate()
  const onFinish = (values: any) => {
    console.log('Form Values:', values)
  }

  const uploadProps: UploadProps = {
    listType: 'picture-card',
    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
    beforeUpload: () => {
      // Prevent auto upload
      return false
    }
  }
  return (
    <div className="my-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Income Head"
            name="incomeHead"
            rules={[{ required: true, message: 'Please select income head' }]}
          >
            <Select placeholder="Select Income Head">
              <Select.Option value="salary">Salary</Select.Option>
              <Select.Option value="bonus">Bonus</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please pick a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Invoice Number" name="invoiceNumber">
            <Input placeholder="Invoice Number" />
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber placeholder="Amount" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Attachment" name="attachment">
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </div>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Description" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              form.resetFields()
              navigate('/dashboard/expense')
            }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default IncomeForm
